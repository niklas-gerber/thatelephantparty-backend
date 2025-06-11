const { sequelize } = require('../db');
const Event = require('./Event');
const TicketPurchase = require('./Ticket');
const Attendee = require('./Attendee');

// Register associations
TicketPurchase.associate({ Attendee });
Attendee.associate({ TicketPurchase });

module.exports = {
  sequelize,
  Event,
  TicketPurchase,
  Attendee
};