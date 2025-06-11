const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const TicketPurchase = sequelize.define('TicketPurchase', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  event_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'events',
      schema: 'app',
      key: 'id'
    }
  },
  buyer_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  payslip_url: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  reference_number: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  total_price: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Stored in cents to avoid floating point issues'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  schema: 'app',
  tableName: 'ticket_purchases',
  freezeTableName: true,
  timestamps: false, // We're using created_at manually
  underscored: true
});

TicketPurchase.associate = function(models) {
  TicketPurchase.hasMany(models.Attendee, {
    foreignKey: 'ticket_purchase_id',
    as: 'attendees'
  });
};

module.exports = TicketPurchase;