const cleaner = require('knex-cleaner');
const db = require('../connection').bookshelf;

global.resetDb = () => {
  beforeEach((done) => {
    cleaner.clean(db.knex, { ignoreTables: ['knex_migrations'] }).then(() => {
      db.knex.seed.run()
      .then(() => { done(); });
    });
  });
};
