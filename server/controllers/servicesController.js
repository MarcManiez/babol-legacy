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

      song(response, parameters, artistBar = 0.9, albumBar = 0.2, songBar = 0.8) {
        if (!response || !parameters) throw new Error('scan.song must take a response and parameters.');
        let highScore = null;
        let link = null;
        const { artist, album, song } = parameters;
        const songs = response.tracks.items;
        for (let i = 0; i < songs.length; i += 1) {
          let totalScore = 0;
          const artistScore = helpers.isMatch(songs[i].artists[0].name, artist);
          if (artistScore < artistBar) continue;
          totalScore += artistScore;
          const albumScore = helpers.isMatch(songs[i].album.name, album);
          if (albumScore < albumBar) continue;
          totalScore += albumScore;
          const songScore = helpers.isMatch(songs[i].name, song);
          if (songScore < songBar) continue;
          totalScore += songScore;
          const score = +(totalScore / 3).toFixed(3);
          if (score > highScore) {
            highScore = score;
            link = songs[i].external_urls.spotify;
          }
        }
        return link;
      },
    },
  },
};
