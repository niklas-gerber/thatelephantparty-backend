
/*
 * DEMO DATA ONLY - Contains development example html for different static pages.
 */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert({ tableName: 'static_pages', schema: 'app' }, [
      {
        name: 'about',
        content: '<h1>About Us</h1><p>We love elephants!</p>',
        last_updated: new Date(),
      },
      {
        name: 'contact',
        content: '<h1>Contact</h1><p>Email: party@elephants.com</p>',
        last_updated: new Date(),
      },
    ], {}); // Target schema
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('static_pages', null, { schema: 'app' });
  }
};