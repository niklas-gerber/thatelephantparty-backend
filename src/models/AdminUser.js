const { DataTypes } = require('sequelize');
const { sequelize } = require('../db.js');
const bcrypt = require('bcryptjs');

const AdminUser = sequelize.define('AdminUser', {
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    set(value) {
      const hash = bcrypt.hashSync(value, 12); // Auto-hash on save
      this.setDataValue('password', hash);
    }
  }
});

module.exports = AdminUser;