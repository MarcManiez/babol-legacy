const axios = require('axios');
const helpers = require('./helpers');

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
        info.type = response.wrapperType;
        if (info.type === 'collection') info.type = 'album';
        if (info.type === 'track') info.type = 'song';
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
      const params = Object.assign({}, { offset, limit, type, q: arguments[0][type] });
      if (params.type === 'song') params.type = 'track';
      return axios.get('https://api.spotify.com/v1/search', { params })
      .then(response => response.data.tracks.items[0].external_urls.spotify); // return scan[type](response)
    },

    scan: {
      Response(response) {
        // loop though an array of scores and
      },

      artist() {

      },

      album() {

      },

      song(response, parameters) {
        if (!response || !parameters) throw new Error('scan.song must take a response and parameters.');
        let link = null;
        let highScore = null;
        const { artist, album, song } = parameters;
        const songs = response.tracks.items;
        for (let i = 0; i < songs.length; i += 1) {
          let totalScore = 0;
          const artistScore = helpers.isMatch(songs[i].artists[0].name, artist);
          totalScore += artistScore;
          const albumScore = helpers.isMatch(songs[i].album.name, album);
          totalScore += albumScore;
          const songScore = helpers.isMatch(songs[i].name, song);
          totalScore += songScore;
          if (totalScore > highScore) {
            highScore = totalScore;
            link = songs[i].external_urls.spotify;
          }
        }
        return link;
      },
    },
  },
};
