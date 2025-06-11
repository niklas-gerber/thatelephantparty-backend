const { NotFoundError } = require('../errors/customErrors');
const storage = require('../services/storage');
const { sequelize } = require('../db');
const { Event, TicketPurchase, Attendee } = require('../models');
const PDFDocument = require('pdfkit');

// GET /api/v1/public/events (Public access - only public fields)
exports.getAllPublicEvents = async (req, res) => {
  const events = await Event.findAll({
    where: { is_active: true },
    attributes: [
      'id',
      'title',
      'display_date',
      'venue_name',
      'venue_address',
      'event_time',
      'description',
      'ticket_price_regular',
      'ticket_price_bundle',
      'bundle_size',
      'is_active',
      'inactive_message',
      'poster_image_url'
    ],
    order: [['start_date', 'ASC']]
  });
  res.json(events);
};

// GET /api/v1/public/events/:id (Public access - only public fields)
exports.getPublicEvent = async (req, res) => {
  const event = await Event.findOne({
    where: { id: req.params.id },
    attributes: [
      'id',
      'title',
      'display_date',
      'venue_name',
      'venue_address',
      'event_time',
      'description',
      'ticket_price_regular',
      'ticket_price_bundle',
      'bundle_size',
      'is_active',
      'inactive_message',
      'poster_image_url'
    ]
  });
  if (!event) throw new NotFoundError('Event');
  res.json(event);
};

// GET all Events with full info for Admin
exports.getAllEvents = async (req, res) => {
  const events = await Event.findAll({
    where: { is_active: true },  // Only show active events
    order: [['start_date', 'ASC']]  // Order by date
  });
  res.json(events);
};

// GET full Event info by ID for Admin
exports.getEvent = async (req, res) => {
  const event = await Event.findOne({
    where: { id: req.params.id }
  });
  if (!event) throw new NotFoundError('Event');
  res.json(event);
};

// POST /admin/events (Create Event with optional poster)
exports.createEvent = async (req, res) => {
  try {
    let posterUrl = null;

    // Handle file upload if present
    if (req.file) {
      posterUrl = await storage.savePrivateFile(req.file);
      req.body.poster_image_url = posterUrl; // Add URL to create payload
    }

    // Create event
    const event = await Event.create(req.body);
    res.status(201).json(event);

  } catch (error) {
    // Cleanup uploaded file if DB operation failed
    if (req.file && posterUrl) {
      await storage.deleteFile(posterUrl).catch(console.error);
    }
    throw error; // Re-throw for catchAsync
  }
};

// PATCH /admin/events/:id (Update Event with optional poster)
exports.updateEvent = async (req, res) => {
  try {
    let newPosterUrl = null;
    let oldPosterUrl = null;

    // Check if existing event has a poster to replace
    const existingEvent = await Event.findByPk(req.params.id);
    if (!existingEvent) throw new NotFoundError('Event');
    oldPosterUrl = existingEvent.poster_image_url;

    // Handle new file upload
    if (req.file) {
      newPosterUrl = await storage.savePrivateFile(req.file);
      req.body.poster_image_url = newPosterUrl;
    }

    // Update event
    const [updated] = await Event.update(req.body, {
      where: { id: req.params.id },
      returning: true
    });

    if (!updated) throw new NotFoundError('Event');

    // Cleanup old poster only after successful update
    if (newPosterUrl && oldPosterUrl) {
      await storage.deleteFile(oldPosterUrl).catch(console.error);
    }

    // Fetch updated event
    const updatedEvent = await Event.findByPk(req.params.id);
    res.json(updatedEvent);

  } catch (error) {
    // Cleanup new file if DB operation failed
    if (req.file && newPosterUrl) {
      await storage.deleteFile(newPosterUrl).catch(console.error);
    }
    throw error; // Re-throw for catchAsync
  }
};

// DELETE /admin/events/:id (Admin-only)
exports.deleteEvent = async (req, res) => {
  const deleted = await Event.destroy({
    where: { id: req.params.id }
  });
  if (!deleted) throw new NotFoundError('Event');
  res.status(204).end(); // No content
};

// Increment Walk-Ins (GCash or Cash)
exports.incrementWalkIns = async (req, res) => {
  const { payment_type } = req.body;

  if (!['cash', 'gcash'].includes(payment_type)) {
    return res.status(400).json({ error: 'payment_type must be "cash" or "gcash"' });
  }

  const field = `walk_in_${payment_type}_count`;
  const event = await Event.findByPk(req.params.id);
  if (!event) throw new NotFoundError('Event');

  const newValue = await event.increment(field, { by: 1 });
  res.json({ [field]: newValue[field] });
};

// Decrement Walk-Ins (Prevent negatives)
exports.decrementWalkIns = async (req, res) => {
  const { payment_type } = req.body;

  if (!['cash', 'gcash'].includes(payment_type)) {
    return res.status(400).json({ error: 'payment_type must be "cash" or "gcash"' });
  }

  const field = `walk_in_${payment_type}_count`;
  const event = await Event.findByPk(req.params.id);
  if (!event) throw new NotFoundError('Event');

  if (event[field] <= 0) {
    return res.status(400).json({ error: 'Count cannot be negative' });
  }

  const newValue = await event.decrement(field, { by: 1 });
  res.json({ [field]: newValue[field] });
};

// Get Current Counts
exports.getWalkInCounts = async (req, res) => {
  const event = await Event.findByPk(req.params.id, {
    attributes: ['walk_in_cash_count', 'walk_in_gcash_count', 'walk_in_price'],
  });
  if (!event) throw new NotFoundError('Event');
  res.json(event);
};

// Generate Attendee List for documentation/Print out
exports.generateAttendeeListPDF = async (req, res) => {
  const event = await Event.findByPk(req.params.id);
  if (!event) throw new NotFoundError('Event');

  // Get all ticket purchases with their attendees
  const ticketPurchases = await TicketPurchase.findAll({
    where: { event_id: event.id },
    include: [{
      model: Attendee,
      as: 'attendees',
      required: true
    }],
    order: [
      ['buyer_name', 'ASC'],
      [{ model: Attendee, as: 'attendees' }, 'name', 'ASC']
    ]
  });

  // PDF Setup
  const doc = new PDFDocument({ margin: 50 });
  const filename = `${event.title.replace(/[^\w]/g, '_')}_Attendees.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  doc.pipe(res);

  // Constants for layout
  const lineHeight = 20;
  const pageBottomMargin = 50;
  let yPosition = 50;

  // Header function (reusable for new pages)
  const addHeader = () => {
    doc.fontSize(16).text(`${event.title} Attendees`, { align: 'center' });
    yPosition += lineHeight * 2;
  };

  // Initial header
  addHeader();

  ticketPurchases.forEach(purchase => {
    // Check if we need a new page (leaving space for at least 3 lines)
    if (yPosition > doc.page.height - pageBottomMargin - (lineHeight * 3)) {
      doc.addPage();
      yPosition = 50;
      addHeader();
    }

    // Buyer name
    doc.fontSize(12).text(purchase.buyer_name, { continued: false });
    yPosition += lineHeight;

    // Secondary attendees
    purchase.attendees.forEach(attendee => {
      if (!attendee.is_primary) {
        doc.fontSize(12).text(`  ${attendee.name}`, { indent: 20 });
        yPosition += lineHeight;
      }
    });

    doc.moveDown();
    yPosition += lineHeight / 2; // Small gap after each group
  });

  doc.end();
};

//Generate Accounting file to document and sum up profits
exports.generateAccountingPDF = async (req, res) => {
  const event = await Event.findByPk(req.params.id);
  if (!event) throw new NotFoundError('Event');

  // 1. Get all ticket purchases with proper grouping
  const ticketPurchases = await sequelize.query(`
  SELECT 
    tp.total_price,
    COUNT(a.id)::integer as attendee_count,
    COUNT(DISTINCT tp.id)::integer as purchase_count
  FROM app.ticket_purchases tp
  JOIN app.attendees a ON tp.id = a.ticket_purchase_id
  WHERE tp.event_id = $1
  GROUP BY tp.total_price, a.ticket_purchase_id
  ORDER BY tp.total_price DESC
  `, {
    bind: [event.id],
    type: sequelize.QueryTypes.SELECT
  });

  // 2.1 Get walk-in counts
  const walkIns = {
    gcash: event.walk_in_gcash_count,
    cash: event.walk_in_cash_count,
    price: event.walk_in_price
  };

  // 2.2 Group identical purchases (same price and attendee count)
  const groupedPurchases = ticketPurchases.reduce((acc, purchase) => {
    const key = `${purchase.total_price}-${purchase.attendee_count}`;
    if (!acc[key]) {
      acc[key] = {
        total_price: purchase.total_price,
        attendee_count: purchase.attendee_count,
        purchase_count: 0,
        total_amount: 0
      };
    }
    acc[key].purchase_count += purchase.purchase_count;
    acc[key].total_amount += purchase.total_price * purchase.purchase_count;
    return acc;
  }, {});


  const sortedPurchases = Object.values(groupedPurchases)
    .sort((a, b) => b.total_price - a.total_price);

  // 3. Calculate totals
  const preregTotal = sortedPurchases.reduce((sum, p) => sum + p.total_amount, 0);

  const totals = {
    prereg: preregTotal,
    gcashWalkIns: walkIns.gcash * walkIns.price,
    cashWalkIns: walkIns.cash * walkIns.price,
    gcashTotal: preregTotal + (walkIns.gcash * walkIns.price),
    grandTotal: preregTotal + (walkIns.gcash * walkIns.price) + (walkIns.cash * walkIns.price)
  };

  // PDF Setup
  const doc = new PDFDocument({ margin: 50 });
  const filename = `${event.title.replace(/[^\w]/g, '_')}_Accounting.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  doc.pipe(res);

  // Header
  doc.fontSize(16).text(`${event.title} - Financial Report`, { align: 'center' });
  doc.fontSize(10).text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' });
  doc.moveDown(2);

  // PREREGISTERED TICKETS SECTION
  doc.fontSize(14).text('PREREGISTERED TICKETS', { underline: true });
  doc.moveDown();

  sortedPurchases.forEach(purchase => {
    doc.fontSize(12)
      .text(`${purchase.total_price} PHP (${purchase.attendee_count} guests) ×${purchase.purchase_count} = ${purchase.total_amount} PHP`);
  });

  doc.moveDown();
  doc.text(`Subtotal: ${totals.prereg} PHP`, { align: 'right' });
  doc.moveDown(2);

  // WALK-INS SECTION
  doc.fontSize(14).text('WALK-INS', { underline: true });
  doc.moveDown();

  doc.fontSize(12)
    .text(`GCash: ${walkIns.gcash} × ${walkIns.price} PHP = ${totals.gcashWalkIns} PHP`)
    .text(`Cash: ${walkIns.cash} × ${walkIns.price} PHP = ${totals.cashWalkIns} PHP`);

  doc.moveDown(2);

  // TOTALS SECTION
  doc.fontSize(14).text('TOTALS', { underline: true });
  doc.moveDown();

  doc.fontSize(12)
    .text(`All GCash (Prereg + Walk-ins): ${totals.gcashTotal} PHP`)
    .text(`Cash Walk-ins: ${totals.cashWalkIns} PHP`)
    .moveDown()
    .text(`GRAND TOTAL: ${totals.grandTotal} PHP`, { bold: true });

  doc.end();
};

// Generate Email List for manually sending emergency updates to all Attendees/Buyers
exports.generateEmailListPDF = async (req, res) => {
  const event = await Event.findByPk(req.params.id);
  if (!event) throw new NotFoundError('Event');

  // Get all unique emails from ticket purchases
  const ticketPurchases = await TicketPurchase.findAll({
    where: { event_id: event.id },
    attributes: ['email'],
    group: ['email'], // Ensure unique emails
    raw: true
  });

  // Extract emails and join with commas
  const emails = ticketPurchases.map(p => p.email).join(', ');

  // PDF Setup
  const doc = new PDFDocument();
  const filename = `${event.title.replace(/[^\w]/g, '_')}_Emails.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  doc.pipe(res);

  // Simple formatting
  doc.fontSize(12).text('Copy-paste these emails into BCC field:', { underline: true });
  doc.moveDown();
  doc.font('Courier').text(emails); // Monospace font for clean copying

  doc.end();
};