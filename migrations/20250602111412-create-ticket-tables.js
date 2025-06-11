'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create ticket_purchases table
    await queryInterface.createTable('ticket_purchases', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      event_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'events',
            schema: 'app'
          },
          key: 'id'
        }
      },
      buyer_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      payslip_url: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      reference_number: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      total_price: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, {
      schema: 'app',
      freezeTableName: true
    });

    // Create attendees table
    await queryInterface.createTable('attendees', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      ticket_purchase_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'ticket_purchases',
            schema: 'app'
          },
          key: 'id'
        }
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      checked_in: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      }
    }, {
      schema: 'app',
      freezeTableName: true
    });

    // Add foreign key indexes for better performance
    await queryInterface.addIndex('app.ticket_purchases', ['event_id'], {
      name: 'idx_ticket_purchases_event_id'
    });

    await queryInterface.addIndex('app.attendees', ['ticket_purchase_id'], {
      name: 'idx_attendees_ticket_purchase_id'
    });

    await queryInterface.addIndex('app.attendees', ['checked_in'], {
      name: 'idx_attendees_checked_in'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop in reverse order due to foreign key constraints
    await queryInterface.dropTable({
      tableName: 'attendees',
      schema: 'app'
    });

    await queryInterface.dropTable({
      tableName: 'ticket_purchases',
      schema: 'app'
    });
  }
};