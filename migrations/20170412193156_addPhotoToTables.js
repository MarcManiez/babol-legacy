exports.up = (knex, Promise) => Promise.all([
  knex.schema.createTable('images', (images) => {
    images.increments('id').primary();
    images.string('url').unique().notNullable();
    images.integer('width');
    images.integer('height');
    images.timestamps(true);
  }),
  knex.schema.table('artists', (artists) => {
    artists.integer('image_id').unsigned();
    artists.foreign('image_id').references('images.id');
    artists.dropForeign('image_id');
  }),
  knex.schema.table('albums', (albums) => {
    albums.integer('image_id').unsigned();
    albums.foreign('image_id').references('images.id');
    albums.dropForeign('image_id');
  }),
  knex.schema.table('songs', (songs) => {
    songs.integer('image_id').unsigned();
    songs.foreign('image_id').references('images.id');
    songs.dropForeign('image_id');
  }),
]);

exports.down = (knex, Promise) => Promise.all([
  knex.schema.table('artists', (artists) => {
    artists.dropColumn('image_id');
  }),
  knex.schema.table('albums', (albums) => {
    albums.dropColumn('image_id');
  }),
  knex.schema.table('songs', (songs) => {
    songs.dropColumn('image_id');
  }),
  knex.schema.dropTable('images'),
]);
