'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('events', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      poster_image_url: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      display_date: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      venue_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      venue_address: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      event_time: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      email_template_content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      ticket_price_regular: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      ticket_price_bundle: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      bundle_size: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      max_tickets: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      ticket_deadline: {
        type: Sequelize.DATE,
        allowNull: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      inactive_message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      start_date: {
        type: Sequelize.DATEONLY,  // DATEONLY for no time component
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, { 
      schema: 'app'  // Explicit schema
    });

    // Index for faster queries on active/sorted events
    await queryInterface.addIndex({ tableName: 'events', schema: 'app' }, ['is_active', 'start_date'], { schema: 'app' });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('events', { schema: 'app' });
  }
};