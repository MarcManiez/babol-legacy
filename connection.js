const config = require('./knexfile')[process.env.NODE_ENV === 'production' ? 'production' : 'development'];

const db = require('knex')(config);

module.exports = require('bookshelf')(db);

console.log('CONFIG OBJECT', config);
// db.migrate.latest(config);
