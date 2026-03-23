
/*
 * DEMO DATA ONLY - Contains development example html for different static pages.
 */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert({ tableName: 'static_pages', schema: 'app' }, [
      {
        name: 'about',
        content: 'ELEPHANT is a nomadic queer techno dance party based in Manila, organized by a collective of LGBTQIA+ artists, DJs, activists and performers. ELEPHANT advocates for safer spaces for the community and equitable pay among artists.',
        last_updated: new Date(),
      },
      {
        name: 'contact',
        content: 'For ticket informations, email us at elephantpartypreregistration@gmail.com or DM @thatelephantparty/@lancenavasca on instagram. Elephant Party is always looking for volunteers, if you are queer and know anything about production, send us a DM @thatelephantparty on instagram.',
        last_updated: new Date(),
      },
    ], {}); // Target schema
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('static_pages', null, { schema: 'app' });
  }
};