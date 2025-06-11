'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('events', 'walk_in_price', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('events', 'walk_in_cash_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('events', 'walk_in_gcash_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('events', 'walk_in_price');
    await queryInterface.removeColumn('events', 'walk_in_cash_count');
    await queryInterface.removeColumn('events', 'walk_in_gcash_count');
  }
};