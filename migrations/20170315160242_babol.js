
exports.up = (knex, Promise) => Promise.all([
  knex.schema.createTable('artists', (artists) => {
    artists.increments('id').primary();
    artists.string('name').unique().notNullable();
    artists.timestamps();
  }),
]);

exports.down = (knex, Promise) => Promise.all([
  knex.schema.dropTable('artists'),
]);
