module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('static_pages', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: { type: Sequelize.STRING, primaryKey: true },
      content: { type: Sequelize.TEXT, allowNull: false },
      last_updated: { 
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') 
      }
    }, { 
      schema: 'app'  // Explicit schema
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('static_pages', { schema: 'app' });
  }
};