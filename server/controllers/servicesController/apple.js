const axios = require('axios');

module.exports = {
    // returns the long form url from a shortened url, needed to derive content information
  getUrl(link) {
    return axios.get(link)
      .then(response => response.headers['x-apple-orig-url'])
      .catch(err => console.log('Error feching apple long form url', err));
  },

    // returns the type of content being shared
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

    // fetches the content's information
  getInfo(id) {
    return axios.get(`https://itunes.apple.com/lookup?id=${id}`)
      .then((response) => {
        response = response.data.results[0];
        const info = {};
        info.artist = response.artistName;
        info.type = response.wrapperType;
        if (info.type === 'collection') info.type = 'album';
        if (info.type === 'track') info.type = 'song';
        if (response.collectionName) {
          info.album = response.collectionName;
          info.album = info.album.replace(/( - Single)$/, '');
        }
        if (response.trackName) info.song = response.trackName;
        return info;
      });
  },

    // retrieves the id for a piece of content based on its long form url
  getId(longUrl) {
    return new Promise((resolve, reject) => {
      if (!longUrl) reject('Error: no link provided id.');
      const id = longUrl.match(/\d+$/g);
      id ? resolve(id[0]) : reject('Error: id could not be extracted.');
    });
  },

    // retrieves the permalink given a set of search criteria
  getLink({ artist, album, song, type }) {

  },
};
