const config = require('./knexfile');

const db = require('knex')(config.development);

module.exports = db;

db.migrate.latest(config);
