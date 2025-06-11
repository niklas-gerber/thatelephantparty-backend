const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Event = sequelize.define('Event', {
  // Fields you need to manually handle
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  display_date: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  venue_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  venue_address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  event_time: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  email_template_content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  ticket_price_regular: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ticket_price_bundle: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  bundle_size: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  max_tickets: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  sold_tickets: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  ticket_deadline: {
    type: DataTypes.DATE,
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  inactive_message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  walk_in_price: {
  type: DataTypes.INTEGER,
  allowNull: false,
  defaultValue: 0
},
walk_in_cash_count: {
  type: DataTypes.INTEGER,
  allowNull: false,
  defaultValue: 0
},
walk_in_gcash_count: {
  type: DataTypes.INTEGER,
  allowNull: false,
  defaultValue: 0
},
  poster_image_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  schema: 'app',
  tableName: 'events',
  freezeTableName: true,
  timestamps: false,  // Disable Sequelize auto-timestamps (you manage them)
  underscored: true   // Ensure snake_case fields
});

module.exports = Event;