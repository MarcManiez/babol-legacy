const axios = require('axios');
const helpers = require('./helpers');

module.exports = {
  apple: {
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
  },
  spotify: {
    // retrieves content id based on url
    getId(link) {

    },

    // retrieves content information based on id
    getInfo(id) {

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
      .then(response => module.exports.spotify.scan[type](response, arguments[0])); // return scan[type](response)
    },

    scan: {
      // retrieves the artist search result with the highest score
      artist(response, parameters, benchmark = 0.5) {
        if (!response || !parameters) throw new Error('scan.artist must take a response and parameters.');
        let link = null;
        let highScore = null;
        const { artist, album, song } = parameters;
        const artists = response.data.artists.items;
        for (let i = 0; i < artists.length; i += 1) {
          const artistScore = helpers.isMatch(artists[i].name, artist);
          if (artistScore > highScore) {
            highScore = artistScore;
            link = artists[i].external_urls.spotify;
          }
        }
        return highScore >= benchmark ? link : null;
      },

      // retrieves the album search result with the highest score
      album(response, parameters, benchmark = 0.5) {
        if (!response || !parameters) throw new Error('scan.album must take a response and parameters.');
        let link = null;
        let highScore = null;
        const { artist, album, song } = parameters;
        const albums = response.data.albums.items;
        for (let i = 0; i < albums.length; i += 1) {
          let totalScore = 0;
          const artistScore = helpers.isMatch(albums[i].artists[0].name, artist);
          totalScore += artistScore;
          const albumScore = helpers.isMatch(albums[i].name, album);
          totalScore += albumScore;
          if (totalScore > highScore) {
            highScore = totalScore;
            link = albums[i].external_urls.spotify;
          }
        }
        const score = highScore / 2;
        return score >= benchmark ? link : null;
      },

      // retrieves the song search result with the highest score
      song(response, parameters, benchmark = 0.5) { // we can set a benchmark under which a result will not be considered a match
        if (!response || !parameters) throw new Error('scan.song must take a response and parameters.');
        let link = null;
        let highScore = null;
        const { artist, album, song } = parameters;
        const songs = response.data.tracks.items;
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
        const score = highScore / 3;
        return score >= benchmark ? link : null;
      },
    },
  },
};
