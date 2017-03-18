const axios = require('axios');

module.exports = {
  apple: {
    getUrl(link) {
      return axios.get(link)
      .then(response => response.headers['x-apple-orig-url'])
      .catch(err => console.log('Error feching apple long form url', err));
    },

    getType(longUrl) {
      return new Promise((resolve, reject) => {
        const typeRegex = {
          song: /\?i=\d+$/g,
          album: /\/album\//g,
          artist: /\/artist\//g,
        };
        for (const type in typeRegex) {
          if (longUrl.match(typeRegex[type])) return resolve(type);
        }
        return reject('Could not derive type based on provided url.');
      });
    },

    getInfo(id) {
      return axios.get(`https://itunes.apple.com/lookup?id=${id}`)
      .then((response) => {
        response = response.data.results[0];
        const info = {};
        info.artist = response.artistName;
        if (response.collectionName) info.album = response.collectionName;
        if (response.trackName) info.song = response.trackName;
        return info;
      });
    },

    getId(longUrl) {
      return new Promise((resolve, reject) => {
        if (!longUrl) reject('Error: no link provided id.');
        const id = longUrl.match(/\d+$/g);
        id ? resolve(id[0]) : reject('Error: id could not be extracted.');
      });
    },

    getLink({ artist, album, song }) {

    },
  },
  spotify: {
    getId(link) {

    },

    getInfo(id) {

    },

    getLink({ artist, album, song, type, offset = 1, limit = 1 }) {
      const params = Object.assign(arguments[0], { offset, limit });
      if (params.type === 'song') params.type = 'track';
      return axios.get('https://api.spotify.com/v1/search', { params })
      .then(response => response.data.tracks.items[0].external_urls.spotify);
    },
  },
};
