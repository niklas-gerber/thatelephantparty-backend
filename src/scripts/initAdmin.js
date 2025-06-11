const { sequelize } = require('../db');
const AdminUser = require('../models/AdminUser');

// Script to create Admin Username and Password from .env in DB
module.exports = async () => {
  const adminExists = await AdminUser.findOne({ 
    where: { username: process.env.ADMIN_USER } 
  });
  if (!adminExists && process.env.ADMIN_USER && process.env.ADMIN_PASSWORD) {
    await AdminUser.create({ 
      username: process.env.ADMIN_USER,
      password: process.env.ADMIN_PASSWORD // Auto-hashed by model
    });
    console.log('Admin user created');
  }
};