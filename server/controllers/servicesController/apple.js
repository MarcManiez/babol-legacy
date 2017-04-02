const axios = require('axios');
const helpers = require('../helpers');

module.exports = {
    // retrieves the id for a piece of content based on its long form url
  getId(longUrl) {
    return new Promise((resolve, reject) => {
      if (!longUrl) reject('Error: no link provided.');
      const id = longUrl.match(/\d+$/g);
      id ? resolve(id[0]) : reject('Error: id could not be extracted.');
    });
  },

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


    // retrieves the permalink given a set of search criteria
  getLink({ artist, album, song, type }) {
    let entity = type;
    if (type === 'song') entity = 'musicTrack';
    else if (type === 'artist') entity = 'musicArtist';
    const attribute = `${type}Term`;
    const params = { media: 'music', term: arguments[0][type], entity, attribute };
    return axios.get('https://itunes.apple.com/search', { params })
      .then(response => module.exports.scan(response, arguments[0]));
  },

  scan(response, parameters, benchmark = 0.5) {
    if (!response || !parameters) throw new Error('scan.song must take a response and parameters.');
    const { artist, album, song, type } = parameters;
    let link = null;
    let highScore = null;
    const coefficientMap = { song: 3, album: 2, artist: 1 };
    const coefficient = coefficientMap[type];
    const items = response.data.results;
    for (let i = 0; i < items.length; i += 1) {
      let totalScore = 0;
      const artistScore = helpers.isMatch(items[i].artistName, artist);
      totalScore += artistScore * 1.5; // arbitrarily giving artist matches a higher corefficient to correct certain results
      if (album) {
        let albumScore = 0;
        try {
          albumScore = helpers.isMatch(items[i].collectionName, album);
          totalScore += albumScore;
        } catch (error) {
          console.warn(error);
        }
      }
      if (song) {
        let songScore = 0;
        try {
          songScore = helpers.isMatch(items[i].trackName, song);
          totalScore += songScore;
        } catch (error) {
          console.warn(error);
        }
      }
      if (totalScore > highScore) {
        highScore = totalScore;
        const linkMap = {
          song: 'trackViewUrl',
          album: 'collectionViewUrl',
          artist: 'artistLinkUrl',
        };
        link = items[i][linkMap[type]];
      }
    }
    const score = highScore / coefficient;
    return score >= benchmark ? link : null;
  },
};
