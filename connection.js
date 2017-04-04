const config = require('./knexfile')[process.env.PRODUCTION ? 'production' : 'development'];

const db = require('knex')(config);

module.exports = require('bookshelf')(db);

// db.migrate.latest(config);
