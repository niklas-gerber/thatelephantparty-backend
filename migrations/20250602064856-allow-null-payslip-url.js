// migrations/[timestamp]-allow-null-payslip-url.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn(
      {
        tableName: 'ticket_purchases',
        schema: 'app'
      },
      'payslip_url',
      {
        type: Sequelize.STRING(255),
        allowNull: true
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn(
      {
        tableName: 'ticket_purchases',
        schema: 'app'
      },
      'payslip_url',
      {
        type: Sequelize.STRING(255),
        allowNull: false
      }
    );
  }
};