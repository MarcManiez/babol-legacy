exports.up = (knex, Promise) => Promise.all([
  knex.schema.createTable('artists', (artists) => {
    artists.increments('id').primary();
    artists.string('slug').unique().notNullable();
    artists.string('name').notNullable();
    artists.string('apple_id').unique();
    artists.string('apple_url').unique();
    artists.string('spotify_id').unsigned();
    artists.string('spotify_url').unique();
    artists.timestamps(true);
  }),
  knex.schema.createTable('albums', (albums) => {
    albums.increments('id').primary();
    albums.string('slug').unique().notNullable();
    albums.string('name').notNullable();
    albums.string('apple_id').unique();
    albums.string('apple_url').unique();
    albums.string('spotify_id').unique();
    albums.string('spotify_url').unique();
    albums.integer('artist_id').unsigned();
    albums.foreign('artist_id').references('artists.id');
    albums.timestamps(true);
  }),
  knex.schema.createTable('songs', (songs) => {
    songs.increments('id').primary();
    songs.string('slug').unique().notNullable();
    songs.string('name').notNullable();
    songs.string('apple_id').unique();
    songs.string('apple_url').unique();
    songs.string('spotify_id').unique();
    songs.string('spotify_url').unique();
    songs.integer('artist_id').unsigned();
    songs.foreign('artist_id').references('artists.id');
    songs.integer('album_id').unsigned();
    songs.foreign('album_id').references('albums.id');
    songs.dropForeign('album_id');
    songs.timestamps(true);
  }),
]);

exports.down = (knex, Promise) => Promise.all([
  knex.schema.dropTable('songs'),
  knex.schema.dropTable('albums'),
  knex.schema.dropTable('artists'),
]);
