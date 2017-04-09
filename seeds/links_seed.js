exports.seed = (knex, Promise) => knex('artists').insert({ name: 'Aaron Goldberg', slug: '12345678', spotify_id: '1', apple_id: '1' }, 'id')
.then(artists => knex('albums').insert(
  { name: 'Turning Point', artist_id: artists[0], slug: '12345678', spotify_id: '2', apple_id: '2' }, ['id', 'artist_id']))
.then(albums => knex('songs').insert(
  { name: 'Fantasy in D', artist_id: albums[0].artist_id, album_id: albums[0].id, slug: '12345678', spotify_id: '3', apple_id: '3' }, 'id'));
