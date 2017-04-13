exports.up = (knex, Promise) => Promise.all([
  knex.schema.table('artists', (artists) => {
    artists.string('image');
  }),
  knex.schema.table('albums', (albums) => {
    albums.string('image');
  }),
  knex.schema.table('songs', (songs) => {
    songs.string('image');
  }),
]);

exports.down = (knex, Promise) => Promise.all([
  knex.schema.table('artists', (artists) => {
    artists.dropColumn('image');
  }),
  knex.schema.table('artists', (albums) => {
    albums.dropColumn('image');
  }),
  knex.schema.table('artists', (songs) => {
    songs.dropColumn('image');
  }),
]);
