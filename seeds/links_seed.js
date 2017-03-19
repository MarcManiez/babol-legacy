exports.seed = (knex, Promise) => knex('artists').insert([
  { name: 'Aaron Goldberg' },
])
.then(() => knex('albums').insert([
  { name: 'Turning Point', artist_id: 1 },
]))
.then(() => knex('songs').insert([
  { name: 'Fantasy in D', artist_id: 1, album_id: 1 },
]))
.then(() => knex('links').insert([
  {
    apple: 'https://itun.es/us/nZ-wz?i=425454830',
    spotify: 'https://open.spotify.com/track/2OWKDnQje6CyuUHtOWVuD9',
    type: 'song',
    artist_id: 1,
    album_id: 1,
    song_id: 1,
  },
  {
    apple: 'https://itun.es/us/nZ-wz',
    spotify: 'https://open.spotify.com/album/1NYLLZQ0DBSMA6hDjonTnR',
    type: 'album',
    artist_id: 1,
    album_id: 1,
  },
  {
    apple: 'https://itun.es/us/8FRu',
    spotify: 'https://open.spotify.com/artist/0BTfBwYC5Mw5ezDg91JBma',
    type: 'artist',
    artist_id: 1,
  },
]));
