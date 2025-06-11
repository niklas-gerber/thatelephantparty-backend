const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Attendee = sequelize.define('Attendee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ticket_purchase_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'ticket_purchases',
      schema: 'app',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  is_primary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  checked_in: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'For door check-in system'
  }
}, {
  schema: 'app',
  tableName: 'attendees',
  freezeTableName: true,
  timestamps: false,
  underscored: true
});

Attendee.associate = function(models) {
  Attendee.belongsTo(models.TicketPurchase, {
    foreignKey: 'ticket_purchase_id',
    as: 'ticketPurchase'
  });
};

module.exports = Attendee;