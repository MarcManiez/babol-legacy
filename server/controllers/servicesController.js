const axios = require('axios');
// create functions that retrieve link type + artist + (album) + (song)

module.exports = {
  apple: {
    getUrl(link) { // TODO: needs tests
      return axios.get(link)
      .then(response => response.headers['x-apple-orig-url'])
      .catch(err => console.log('Error feching apple long form url', err));
    },

    getType(longUrl) { // TODO: needs tests
      let type;
      if (longUrl.match(/\?i=\d+$/g)) {
        type = 'song';
      } else if (longUrl.match(/\/id\d+$/g)) {
        type = 'album';
      } else {
        type = 'artist';
      }
      return type;
    },

    getInfo(longUrl) { // TODO: needs tests

    },
  },
  spotify: {
    getInfo(link) {

    },
  },
};
