const { sequelize } = require('../db');
const { Op } = require('sequelize');
const { NotFoundError, ConflictError, DuplicateEmailError, DuplicateReferenceError } = require('../errors/customErrors');
const { Event, TicketPurchase, Attendee } = require('../models');
const storage = require('../services/storage');
const { sendTicketConfirmation } = require('../services/mailService');

// Public Ticket Purchase
exports.createTicketPurchase = async (req, res) => {
    let payslipUrl = null;
    try {
        const { id: event_id } = req.params;
        const { quantity, buyer_name, phone, email, reference_number, attendees } = req.body;

        // Handle case where attendees comes as stringified JSON
        if (typeof attendees === 'string') {
            try {
                attendees = JSON.parse(attendees);
            } catch (e) {
                throw new ConflictError('Invalid attendees format');
            }
        }

        // Handle case where attendees comes as object (from form-data)
        if (attendees && !Array.isArray(attendees)) {
            attendees = Object.values(attendees);
        }

        // Validate attendees count matches quantity
        if (!attendees || !Array.isArray(attendees) || attendees.length !== parseInt(quantity)) {
            throw new ConflictError('Attendees count must match ticket quantity');
        }

        // Handle file upload first
        if (!req.file) {
            throw new ConflictError('Payslip upload is required');
        }
        payslipUrl = await storage.savePublicFile(req.file);
        if (!payslipUrl) {
            throw new Error('Failed to upload payslip');
        }

        // Purchase Ticket by Database Entry
        const result = await sequelize.transaction(async (t) => {
            const event = await Event.findByPk(event_id, {
                transaction: t,
                attributes: ['id', 'is_active', 'sold_tickets', 'max_tickets', 'ticket_price_regular', 'ticket_price_bundle', 'bundle_size']
            });
            if (!event) throw new NotFoundError('Event');
            if (!event.is_active) throw new ConflictError('Event is not active');
            
            // Check ticket availability (using attendees.length instead of quantity for extra safety)
            if (event.sold_tickets + attendees.length > event.max_tickets) {
                throw new ConflictError(`Only ${event.max_tickets - event.sold_tickets} tickets left`);
            }
            // Calculate price based on bundle rules
            let totalPrice;
            const quantity = attendees.length;
            
            if (event.bundle_size && quantity >= event.bundle_size && event.ticket_price_bundle) {
                // Calculate how many full bundles we have
                const fullBundles = Math.floor(quantity / event.bundle_size);
                // Calculate remaining individual tickets
                const remainingTickets = quantity % event.bundle_size;
                
                totalPrice = (fullBundles * event.ticket_price_bundle) + 
                            (remainingTickets * event.ticket_price_regular);
            } else {
                // Regular pricing
                totalPrice = quantity * event.ticket_price_regular;
            }
            const existingPurchase = await TicketPurchase.findOne({
                where: {
                    [Op.or]: [
                        { email },
                        { reference_number }
                    ]
                },
                transaction: t
            });
            
            // Validate that we have a new Email and a new ReferenceNr on the Payslip
            if (existingPurchase) {
                if (existingPurchase.email === email) throw new DuplicateEmailError();
                if (existingPurchase.reference_number === reference_number) throw new DuplicateReferenceError();
            }

            // Increment sold tickets counter
            await Event.increment('sold_tickets', {
                by: quantity,
                where: { id: event_id },
                transaction: t
            });
            
            // Create new database entry
            const ticketPurchase = await TicketPurchase.create({
                event_id,
                buyer_name,
                phone,
                email,
                reference_number,
                total_price: totalPrice,
                payslip_url: payslipUrl, // Use uploaded URL
                quantity: quantity
            }, { transaction: t });

            // Register guests
            await Attendee.bulkCreate(
                attendees.map((attendee, index) => ({
                    ticket_purchase_id: ticketPurchase.id,
                    name: attendee.name,
                    is_primary: index === 0,
                    checked_in: false
                })),
                { transaction: t }
            );

            // After ticket creation, fetch the event for email content
            const eventformail = await Event.findByPk(event_id, {
                attributes: ['title', 'email_template_content'],
                transaction: t
            });

            // Send email (fire-and-forget, no await)
            sendTicketConfirmation(
                email,           // buyerEmail
                buyer_name,      // buyerName
                eventformail.title,     // eventTitle
                eventformail.email_template_content // HTML content
            ).catch(e => logger.error(e)); // Log if send fails

            return ticketPurchase;
        });

        res.status(201).json(result);

    } catch (error) {
        // Undo the file Upload if something goes wrong
        if (req.file && payslipUrl) {
            await storage.deleteFile(payslipUrl).catch(console.error);
        }
        throw error;
    }
};

// Admin CRUD: Read Tickets
exports.getAllTickets = async (req, res) => {
    const tickets = await TicketPurchase.findAll({
        include: [{
            model: Attendee,
            as: 'attendees', // Match the alias defined in the association
            attributes: ['name', 'checked_in']
        }],
        order: [['created_at', 'DESC']]
    });
    res.json(tickets);
};

// Admin CRUD: Update Ticket
exports.updateTicket = async (req, res) => {
    let newPayslipUrl = null;
    let oldPayslipUrl = null;

    try {
        const ticket = await TicketPurchase.findByPk(req.params.id);
        if (!ticket) throw new NotFoundError('Ticket');

        // Handle payslip upload (if provided)
        if (req.file) {
            newPayslipUrl = await storage.savePublicFile(req.file);
            oldPayslipUrl = ticket.payslip_url; // Save old URL for cleanup
            req.body.payslip_url = newPayslipUrl; // Update payload
        }

        // Update ticket fields (excluding immutable ones like event_id)
        const { event_id, ...updatableFields } = req.body;
        await ticket.update(updatableFields);

        // Cleanup old payslip after successful update
        if (newPayslipUrl && oldPayslipUrl) {
            await storage.deleteFile(oldPayslipUrl).catch(console.error);
        }

        res.json(ticket);
    } catch (error) {
        // Cleanup new payslip if update fails
        if (req.file && newPayslipUrl) {
            await storage.deleteFile(newPayslipUrl).catch(console.error);
        }
        throw error;
    }
};

// Admin CRUD: Delete Ticket
exports.deleteTicket = async (req, res) => {
    const ticket = await TicketPurchase.findByPk(req.params.id);
    if (!ticket) throw new NotFoundError('Ticket');

    await sequelize.transaction(async (t) => {
        // Get count of attendees (which equals quantity)
        const attendeeCount = await Attendee.count({
            where: { ticket_purchase_id: ticket.id },
            transaction: t
        });

        // Delete attendees first (foreign key constraint)
        await Attendee.destroy({
            where: { ticket_purchase_id: ticket.id },
            transaction: t
        });

        // Decrement sold_tickets count
        await Event.decrement('sold_tickets', {
            by: attendeeCount,
            where: { id: ticket.event_id },
            transaction: t
        });

        // Delete ticket
        await ticket.destroy({ transaction: t });

        // Cleanup payslip file
        if (ticket.payslip_url) {
            await storage.deleteFile(ticket.payslip_url).catch(console.error);
        }
    });

    res.status(204).end();
};

// Get all Attendees for Door Registration
exports.getEventAttendees = async (req, res) => {
  const { eventId } = req.params;

  // Validate event exists
  const event = await Event.findByPk(eventId);
  if (!event) throw new NotFoundError('Event');

  // Fetch all attendees for the event with their ticket purchase (buyer name)
  const attendees = await Attendee.findAll({
    include: [{
      model: TicketPurchase,
      as: 'ticketPurchase', 
      where: { event_id: eventId },
      attributes: ['buer_name'], // Only fetch buyer_name for grouping
      required: true
    }],
    attributes: ['id', 'name', 'checked_in'], // Only necessary fields
    order: [['name', 'ASC']] // Sort by attendee name
  });

  // Format response with group_identifier (buyer_name)
  const formattedAttendees = attendees.map(attendee => ({
    id: attendee.id,
    name: attendee.name,
    checked_in: attendee.checked_in,
    group_identifier: attendee.ticketPurchase.buyer_name
  }));

  res.json(formattedAttendees);
};

// Door Service Check In/Out of Guest
exports.toggleAttendeeCheckIn = async (req, res) => {
  const { attendeeId } = req.params;

  // Find attendee and throw 404 if not found
  const attendee = await Attendee.findByPk(attendeeId);
  if (!attendee) throw new NotFoundError('Attendee');

  // Toggle checked_in status
  attendee.checked_in = !attendee.checked_in;
  await attendee.save();

  // Return minimal data for frontend
  res.json({
    id: attendee.id,
    name: attendee.name,
    checked_in: attendee.checked_in
  });
};
