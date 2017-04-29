let config = require('./knexfile');

switch (process.env.NODE_ENV) {
case 'production':
  config = config.production;
  break;
case 'test':
  config = config.test;
  break;
default:
  config = config.development;
}

const knex = require('knex')(config);
const bookshelf = require('bookshelf')(knex);

module.exports = {
  bookshelf,
  knex,
};
