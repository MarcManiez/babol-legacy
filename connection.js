const config = require('./knexfile');

const db = require('knex')(config.development);

module.exports = require('bookshelf')(db);

// db.migrate.latest(config);
