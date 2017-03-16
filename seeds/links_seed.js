
exports.seed = (knex, Promise) => knex('links').del()
  .then(() => knex('songs').del())
  .then(() => knex('albums').del())
  .then(() => knex('artists').del())
  .then(() => knex('artists').insert([
    { id: 1, name: 'Aaron Goldberg' },
  ]))
  .then(() => knex('albums').insert([
    { id: 1, name: 'Turning Point', artist_id: 1 },
  ]))
  .then(() => knex('songs').insert([
    { id: 1, name: 'Fantasy in D', artist_id: 1, album_id: 1 },
  ]))
  .then(() => knex('links').insert([
    {
      id: 1,
      appleLink: 'https://itun.es/us/nZ-wz?i=425454830',
      spotifyLink: 'https://open.spotify.com/track/2OWKDnQje6CyuUHtOWVuD9',
      type: 'song',
      artist_id: 1,
      album_id: 1,
      song_id: 1,
    },
    {
      id: 2,
      appleLink: 'https://itun.es/us/nZ-wz',
      spotifyLink: 'https://open.spotify.com/album/1NYLLZQ0DBSMA6hDjonTnR',
      type: 'album',
      artist_id: 1,
      album_id: 1,
    },
    {
      id: 3,
      appleLink: 'https://itun.es/us/8FRu',
      spotifyLink: 'https://open.spotify.com/artist/0BTfBwYC5Mw5ezDg91JBma',
      type: 'artist',
      artist_id: 1,
    },
  ]));
