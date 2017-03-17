const axios = require('axios');
// create functions that retrieve link type + artist + (album) + (song)

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

    getInfo(longUrl) { // TODO: needs tests

    },

    getId(longUrl) {
      return new Promise((resolve, reject) => {
        if (!longUrl) reject('Error: no link provided id.');
        const id = longUrl.match(/\d+$/g);
        id ? resolve(id[0]) : reject('Error: id could not be extracted.');
      });
    },
  },
  spotify: {
    getInfo(link) {

    },
  },
};
