exports.seed = (knex, Promise) => knex('artists').insert({ name: 'Aaron Goldberg', slug: 'a12345678', spotify_id: '1', apple_id: '1' }, 'id')
.then(artists => knex('albums').insert(
  { name: 'Turning Point', artist_id: artists[0], slug: 'c12345678', spotify_id: '2', apple_id: '2' }, ['id', 'artist_id']))
.then(albums => knex('songs').insert({
  name: 'Fantasy in D',
  artist_id: albums[0].artist_id,
  album_id: albums[0].id,
  slug: 's12345678',
  spotify_id: '2OWKDnQje6CyuUHtOWVuD9',
  apple_id: '425454830',
  apple_url: 'https://itun.es/us/nZ-wz?i=425454830',
  spotify_url: 'https://open.spotify.com/track/2OWKDnQje6CyuUHtOWVuD9',
}));
