const axios = require('axios');
const helpers = require('../helpers');


const selectImage = module.exports.selectImage = (imageArray) => {
  const idealSize = 300;
  let bestImage;
  let bestScore;
  imageArray.forEach((image) => {
    if (image.height < 200 || image.width < 200) return;
    const score = Math.abs(image.height - idealSize) + Math.abs(image.width - idealSize);
    if (score < bestScore || bestScore === undefined) {
      bestScore = score;
      bestImage = image;
    }
  });
  return bestImage;
};

module.exports = {
  // retrieves content id based on url
  getId(longUrl) {
    return new Promise((resolve, reject) => {
      if (!longUrl) reject(new Error('No link provided.'));
      const id = longUrl.match(/\w+$/g)[0];
      id ? resolve(id) : reject(new Error('Id could not be extracted.'));
    });
  },

  getType(longUrl) {
    const typeRegex = {
      track: /([/:])track\1/g,
      album: /([/:])album\1/g,
      artist: /([/:])artist\1/g,
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
      info.image = selectImage(response.images || response.album.images);
      info.type = response.type;
      if (info.type === 'track') info.type = 'song';
      info.artist = info.type === 'artist' ? response.name : response.artists[0].name;
      if (info.type === 'album') {
        info.album = response.name;
      } else if (response.album) {
        info.album = response.album.name;
      }
      if (info.type === 'song') info.song = response.name;
      return info;
    });
  },

  // retrieves Spotify link based on search criteria
  getLink({ artist, album, song, type }) { // remove offset, add artist / song / album when possible
    return module.exports.search(arguments[0])
    .then(response => module.exports.scan(response, arguments[0]));
  },

  getData(link) {
    const data = { service: 'spotify' };
    return module.exports.getId(link)
    .then((id) => {
      data.id = id;
      data.spotify_id = id;
      const type = module.exports.getType(link);
      data.spotify_url = `https://open.spotify.com/${type === 'song' ? 'track' : type}/${id}`;
      return module.exports.getInfo({ type, id });
    })
    .then(info => Object.assign(data, info));
  },

  // analyze a Spotify search API response object and return item with the highest score
  scan(response, parameters, benchmark = 0.75) {
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
    if (score >= benchmark) return link;
    throw new Error('No link was found whose score was high enough');
  },

  search({ song, album, artist, type }) {
    const songSearches = [
      [`track:${JSON.stringify(song)} artist:${JSON.stringify(artist)} album:${JSON.stringify(album)}`],
      [
        `track:${JSON.stringify(song)} album:${JSON.stringify(album)}`,
        `track:${JSON.stringify(song)} artist:${JSON.stringify(artist)}`,
      ],
      [`${song} ${artist} ${album}`],
      [
        `${song} ${artist}`,
        `${song} ${album}`,
      ],
      [`${song}`],
    ];
    const albumSearches = [
      [`artist:${artist} album:${album}`],
      [`${album}`],
      [`${artist} ${album}`],
    ];
    const artistSearches = [
      [
        `artist:${artist}`,
        `${artist}`,
      ],
    ];
    const spotifySearches = { song: songSearches, album: albumSearches, artist: artistSearches };
    return new Promise((resolve, reject) => {
      const dataMap = { song: 'tracks', album: 'albums', artist: 'artists' };
      const dataType = dataMap[type];
      const cases = spotifySearches[type];
      const trySearch = (index = 0) => {
        if (!cases[index]) reject('Could not retrieve any results from Spotify\'s search API.');
        const searches = cases[index]
          .map((search) => {
            const params = { type, q: search };
            if (type === 'song') params.type = 'track';
            return axios.get('https://api.spotify.com/v1/search', { params });
          });
        Promise.all(searches).then((results) => {
          const combinedResults = { data: { [dataType]: { items: [] } } };
          for (let i = 0; i < results.length; i += 1) {
            combinedResults.data[dataType].items = combinedResults.data[dataType].items.concat(results[i].data[dataType].items);
          }
          if (!combinedResults.data[dataType].items.length) return trySearch(index + 1);
          return resolve(combinedResults);
        });
      };
      trySearch();
    });
  },
};
