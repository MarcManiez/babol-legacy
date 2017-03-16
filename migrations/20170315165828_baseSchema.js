
exports.up = (knex, Promise) => Promise.all([
  knex.schema.createTable('albums', (albums) => {
    albums.increments('id').primary();
    albums.string('name').notNullable();
    albums.integer('artist_id').unsigned();
    albums.foreign('artist_id').references('artists.id');
    albums.timestamps();
  }),
  knex.schema.createTable('songs', (songs) => {
    songs.increments('id').primary();
    songs.string('name').notNullable();
    songs.integer('artist_id').unsigned();
    songs.foreign('artist_id').references('artists.id');
    songs.integer('album_id').unsigned();
    songs.foreign('album_id').references('albums.id');
    songs.dropForeign('album_id');
    songs.timestamps();
  }),
  knex.schema.createTable('links', (links) => {
    links.increments('id').primary();
    links.string('appleLink').unique();
    links.string('spotifyLink').unique();
    links.string('type').notNullable();
    links.integer('artist_id').unsigned();
    links.foreign('artist_id').references('artists.id');
    links.integer('album_id').unsigned();
    links.foreign('album_id').references('albums.id');
    links.dropForeign('album_id');
    links.integer('song_id').unsigned();
    links.foreign('song_id').references('songs.id');
    links.dropForeign('song_id');
    links.timestamps();
  }),
]);

exports.down = (knex, Promise) => Promise.all([
  knex.schema.dropTable('albums'),
  knex.schema.dropTable('songs'),
  knex.schema.dropTable('links'),
]);
