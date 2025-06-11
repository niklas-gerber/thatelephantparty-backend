const { DataTypes } = require('sequelize');
const { sequelize } = require('../db.js'); // Your Sequelize instance

const StaticPage = sequelize.define('StaticPage', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isIn: [['about', 'contact', 'features']] // Allowed page names
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  lastUpdated: {
    type: DataTypes.DATE,
    field: 'last_updated', // Map to correct column
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false, // Disable Sequelize auto-timestamps
  schema: 'app',
  tableName: 'static_pages', // ← Force exact table name
  freezeTableName: true,    // ← Prevent pluralization
  hooks: {
    beforeUpdate: (page) => {
      page.lastUpdated = new Date(); // Auto-update on change
    }
  }
});

module.exports = StaticPage;