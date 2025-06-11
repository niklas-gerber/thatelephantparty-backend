'use strict';

/*
 * DEMO DATA ONLY - Contains fictional events for development
 * - All dates are in the past/future (no real events)
 * - Venue details are generic placeholders
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert({ tableName: 'events', schema: 'app' }, [
      // 1. Active event with bundles
      {
        title: "New Year's Bash",
        display_date: "Dec 31, 2024",
        venue_name: "Sky Lounge",
        venue_address: "123 Main St, Manila, PH",
        event_time: "9PM till sunrise",
        description: "3 DJs, fireworks, open bar!",
        email_template_content: "Your NYE ticket is confirmed! Event: {title}",
        ticket_price_regular: 800,
        ticket_price_bundle: 3000,  // 5 tickets for 3000 (600/ticket)
        bundle_size: 5,
        max_tickets: 150,
        ticket_deadline: new Date('2024-12-30T23:59:59Z'),
        is_active: true,
        start_date: new Date('2024-12-31'),
        created_at: new Date(),
        updated_at: new Date()
      },
      // 2. Past event (inactive)
      {
        title: "Summer Beach Party",
        display_date: "Jun 15, 2024",
        venue_name: "White Sands",
        venue_address: "Beach Road, Boracay",
        event_time: "2PM-10PM",
        description: "SOLD OUT!",
        email_template_content: "Thanks for attending!",
        ticket_price_regular: 500,
        ticket_price_bundle: null,  // No bundles
        bundle_size: null,
        max_tickets: 100,
        ticket_deadline: new Date('2024-06-10T23:59:59Z'),
        is_active: false,
        inactive_message: "Sold out! Join waitlist at contact@example.com",
        start_date: new Date('2024-06-15'),
        created_at: new Date(),
        updated_at: new Date()
      },
      // 3. Active event without bundles
      {
        title: "Indie Music Night",
        display_date: "Jul 20, 2024",
        venue_name: "The Underground",
        venue_address: "456 Art District, QC",
        event_time: "7PM-1AM",
        description: "5 local bands, free merch!",
        email_template_content: "Your ticket for {title} is ready!",
        ticket_price_regular: 400,
        ticket_price_bundle: null,
        bundle_size: null,
        max_tickets: 80,
        ticket_deadline: new Date('2024-07-18T23:59:59Z'),
        is_active: true,
        start_date: new Date('2024-07-20'),
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {}, { schema: 'app' });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete({ tableName: 'events', schema: 'app' }, null, { schema: 'app' });
  }
};