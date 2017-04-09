const config = require('./knexfile')[process.env.NODE_ENV === 'production' ? 'production' : 'development'];

const knex = require('knex')(config);
const bookshelf = require('bookshelf')(knex);

module.exports = {
  bookshelf,
  knex,
};
