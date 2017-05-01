const axios = require('axios');
const helpers = require('../helpers');
const Image = require('../../../database/models/image');

module.exports = {
  // selects the best fitting image out of an array of Spotify image results
  selectImage(imageArray) {
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
  },

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
      info.image = module.exports.selectImage(response.images || response.album.images);
      info.type = response.type;
      if (info.type === 'track') info.type = 'song';
      info.artist = info.type === 'artist' ? response.name : response.artists[0].name;
      if (info.type === 'album') {
        info.album = response.name;
      } else if (response.album) {
        info.album = response.album.name;
      }
      if (info.type === 'song') info.song = response.name;
      module.exports.gatherInfo(info, response);
      return info;
    });
  },

  // helper for .getInfo and .scan. Properties that need to be retrieved during any contact with the Spotify API may be retrieved with this method.
  gatherInfo(info, content) {
    info.spotify_artist_id = content.artists ? content.artists[0].id : content.id;
    info.spotify_album_id = content.album ? content.album.id : content.id;
    info.spotify_song_id = content.id;
    info.spotify_artist_url = content.artists ? content.artists[0].external_urls.spotify : content.external_urls.spotify;
    info.spotify_album_url = content.album ? content.album.external_urls.spotify : content.external_urls.spotify;
    info.spotify_song_url = content.external_urls.spotify;
    info.artist_image = content.artists ? null : module.exports.selectImage(content.images); // we'll need to ge the image some other way.
    info.album_image = module.exports.selectImage(content.album ? content.album.images : content.images);
    info.song_image = info.album_image;
    return info;
  },

  // retrieves Spotify link based on search criteria
  getLink({ artist, album, song, type }) {
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
    .then((info) => {
      Object.assign(data, info);
      return helpers.findOrCreate(Image, info.image);
    })
    .then((image) => {
      return Object.assign(data, { image_id: image.id });
    });
  },

  // analyze a Spotify search API response object and return item with the highest score
  scan(response, info, benchmark = 0.75) {
    if (!response || !info) throw new Error('scan.song must take a response and info.');
    const { artist, album, song, type } = info;
    let link = null;
    let highScore = null;
    const coefficientMap = { song: 3, album: 2, artist: 1 };
    const coefficient = coefficientMap[type];
    const dataMap = { song: 'tracks', album: 'albums', artist: 'artists' };
    const dataType = dataMap[type];
    const items = response.data[dataType].items;
    for (let i = 0; i < items.length; i += 1) {
      let totalScore = 0;
      const currentArtist = items[i].artists ? items[i].artists[0].name : items[i].name;
      const artistScore = helpers.isMatch(helpers.normalize(currentArtist), helpers.normalize(artist));
      totalScore += artistScore;
      if (album) {
        const currentAlbum = items[i].album ? items[i].album.name : items[i].name;
        const albumScore = helpers.isMatch(helpers.normalize(currentAlbum), helpers.normalize(album));
        totalScore += albumScore;
      }
      if (song) {
        const songScore = helpers.isMatch(helpers.normalize(items[i].name), helpers.normalize(song));
        totalScore += songScore;
      }
      if (totalScore > highScore) {
        highScore = totalScore;
        link = items[i].external_urls.spotify;
        info.image = module.exports.selectImage(items[i].images || items[i].album.images);
        module.exports.gatherInfo(info, items[i]);
      }
    }
    const score = highScore / coefficient;
    if (score >= benchmark) {
      return link;
    } throw new Error('No link was found whose score was high enough');
  },

  search({ song, album, artist, type }) {
    const songSearches = [
      [
        `track:${JSON.stringify(song)} artist:${JSON.stringify(artist)} album:${JSON.stringify(album)}`,
        JSON.stringify(song),
        `${JSON.stringify(album)} ${JSON.stringify(artist)}`,
        `track:${JSON.stringify(song)} album:${JSON.stringify(album)}`,
        `track:${JSON.stringify(song)} artist:${JSON.stringify(artist)}`,
      ],
      [`${JSON.stringify(song)} ${JSON.stringify(artist)} ${JSON.stringify(album)}`],
      [
        `${JSON.stringify(song)} ${JSON.stringify(artist)}`,
        `${JSON.stringify(song)} ${JSON.stringify(album)}`,
      ],
    ];
    const albumSearches = [
      [`artist:${JSON.stringify(artist)} album:${JSON.stringify(album)}`],
      [JSON.stringify(album)],
      [`${JSON.stringify(artist)} ${JSON.stringify(album)}`],
      [`${JSON.stringify(helpers.removeParensContent(album))}`],
      [JSON.stringify(artist)],
    ];
    const artistSearches = [
      [
        `artist:${JSON.stringify(artist)}`,
        JSON.stringify(artist),
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
            const params = { type, q: search, limit: 50 };
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
