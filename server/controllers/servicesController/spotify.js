const axios = require('axios');
const helpers = require('../helpers');

module.exports = {
  // retrieves content id based on url
  getId(longUrl) {
    return new Promise((resolve, reject) => {
      if (!longUrl) reject('Error: no link provided.');
      const result = {
        id: longUrl.match(/\w+$/g)[0],
        type: module.exports.getType(longUrl),
      };
      result ? resolve(result) : reject('Error: id could not be extracted.');
    });
  },

  getType(longUrl) {
    const typeRegex = {
      track: /\/track\//g,
      album: /\/album\//g,
      artist: /\/artist\//g,
    };
    for (const type in typeRegex) {
      if (longUrl.match(typeRegex[type])) return type;
    }
    throw new Error('Could not derive type based on provided url.');
  },

  // retrieves content information based on id
  getInfo({ type, id }) {
    return axios.get(`https://api.spotify.com/v1/${type}s/${id}`)
    .then((response) => {
      response = response.data;
      const info = {};
      info.type = response.type;
      if (info.type === 'track') info.type = 'song';
      info.artist = info.type === 'artist' ? response.name : response.artists[0].name;
      if (info.type === 'album') {
        info.album = response.name;
      } else {
        info.album = response.album ? response.album.name : null;
      }
      info.song = info.type === 'song' ? response.name : null;
      return info;
    });
  },

  // Spotify has no shortened urls, therefore we simply return the input url.
  getUrl: link => link,

  // retrieves Spotify link based on search criteria
  getLink({ artist, album, song, type }) { // remove offset, add artist / song / album when possible
    let q;
    if (type === 'song') q = `track:${song} artist:${artist} album:${album}`;
    if (type === 'album') q = `artist:${artist} album:${album}`;
    if (type === 'artist') q = `artist:${artist}`;
    const params = Object.assign({}, { type, q });
    if (params.type === 'song') params.type = 'track';
    return axios.get('https://api.spotify.com/v1/search', { params })
      // .then(response => module.exports.scan[type](response, arguments[0])); // return scan[type](response)
      .then(response => module.exports.scan(response, arguments[0]));
  },

  // analyze a Spotify search API response object and return item with the highest score
  scan(response, parameters, benchmark = 0.5) {
    if (!response || !parameters) throw new Error('scan.song must take a response and parameters.');
    const { artist, album, song, type } = parameters;
    let link = null;
    let highScore = null;
    const coefficientMap = { song: 3, album: 2, artist: 1 };
    const coefficient = coefficientMap[type];
    const dataMap = { song: 'tracks', album: 'albums', artist: 'artists' };
    const dataType = dataMap[type];
    const items = response.data[dataType].items;
    for (let i = 0; i < items.length; i += 1) {
      let totalScore = 0;
      const artistScore = helpers.isMatch(items[i].artists ? items[i].artists[0].name : items[i].name, artist);
      totalScore += artistScore;
      if (album) {
        const albumScore = helpers.isMatch(items[i].album ? items[i].album.name : items[i].name, album);
        totalScore += albumScore;
      }
      if (song) {
        const songScore = helpers.isMatch(items[i].name, song);
        totalScore += songScore;
      }
      if (totalScore > highScore) {
        highScore = totalScore;
        link = items[i].external_urls.spotify;
      }
    }
    const score = highScore / coefficient;
    return score >= benchmark ? link : null;
  },
};
