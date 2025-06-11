const { Sequelize } = require('sequelize');

// AWS-style connection (environment variables)
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    schema: 'app',
    logging: (sql) => console.log(`[SEQUELIZE] ${sql}`),
    dialectOptions: {
      connectTimeout: 5000  // ← Fail fast if unreachable
    }
  }
  
);

// Add retry logic for Docker startup timing
async function testConnection() {
  let retries = 5;
  while (retries > 0) {
    try {
      await sequelize.authenticate();
      console.log('Database connection OK!');
      return;
    } catch (err) {
      retries--;
      console.log(`Connection failed, retries left: ${retries}`, err.message);
      await new Promise(res => setTimeout(res, 5000)); // Wait 5 seconds
    }
  }
  throw new Error("Failed to connect to database after retries");
}

module.exports = { sequelize, testConnection };