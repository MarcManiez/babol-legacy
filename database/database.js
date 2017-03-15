const connection = {
  client: 'pg',
  connection: process.env.PRODUCTION ? process.env.DATABASE_URL : { user: process.env.PG_USER, database: 'bolster' },
};

const db = require('knex')(connection);

// links
  // type (artist, album, song)
  // itunesLink
  // spotifyLink
  // artist_id
  // song_id
  // album_id
// artists
  // name (unique, required)
// songs
  // name
  // artist_id (required)
// albums
  // name
  // artist_id (required)
