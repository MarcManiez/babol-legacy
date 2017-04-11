const knex = require('../../connection').knex;

const Artist = require('../../database/models/artist');
const Album = require('../../database/models/album');
const Song = require('../../database/models/song');
const helpers = require('./helpers');

const services = require('./servicesController/servicesController');

module.exports = {
  detectService(link) {
    return new Promise((resolve, reject) => {
      const error = new Error('Invalid link or unsupported service.');
      if (!link) reject(error);
      const serviceRegexes = {
        apple: /^https?:\/\/itun\.es\/\S+/g,
        spotify: /^https?:\/\/(play|open)\.spotify\.com\/\S+/g,
      };
      for (const service in serviceRegexes) {
        if (link.match(serviceRegexes[service])) resolve(service);
      }
      return reject(error);
    });
  },

  searchLink(info) { // searches for a group of links based on its type and its song/album/artist name
    switch (info.type) {
    case 'song':
      return Song.where({ [`${info.service}_id`]: info.id }).fetch({ withRelated: ['artist', 'album'] });
    case 'album':
      return Album.where({ [`${info.service}_id`]: info.id }).fetch({ withRelated: ['artist'] });
    case 'artist':
      return Artist.where({ [`${info.service}_id`]: info.id }).fetch();
    }
    throw new Error('Specify a correct type for searchlink.');
  },

  getInfo(link) {
    return module.exports.detectService(link)
    .then(service => services[service].getData(link));
  },

  searchbySlug(slug) {
    const type = helpers.typeSwitch[slug[0]];
    const model = helpers.tableSwitch[type];
    const options = helpers.withRelatedSwitch[type];
    return model.where({ slug }).fetch({ withRelated: options });
  },

  fetchRemainingData(info, remainingServices) {
    const retrievals = remainingServices
    .map(musicService => services[musicService].getLink(info)
      .then((permaLink) => {
        info[`${musicService}_url`] = permaLink;
        return services[musicService].getId(permaLink);
      })
      .then((id) => {
        info[`${musicService}_id`] = id;
      }));
    return Promise.all(retrievals).then(() => info);
  },

  createLink(info) {
    const { type, song, album, artist, apple_id, apple_url, spotify_id, spotify_url } = info;
    const instances = [];
    const createdInfo = { apple_id, apple_url, spotify_id, spotify_url, slug: helpers.createSlug('a') };
    return helpers.findOrCreate(Artist, { name: info.artist }, createdInfo)
    .then((artistInstance) => {
      instances.push(artistInstance);
      createdInfo.slug = helpers.createSlug('c');
      return info.album ? helpers.findOrCreate(Album, { name: info.album, artist_id: artistInstance.id }, createdInfo) : null;
    })
    .then((albumInstance) => {
      instances.push(albumInstance);
      createdInfo.slug = helpers.createSlug('s');
      const properties = { name: info.song, artist_id: instances[0].id };
      if (albumInstance) properties.album_id = albumInstance.id;
      return info.song ? helpers.findOrCreate(Song, properties, createdInfo) : null;
    })
    .then(() => { // TODO: this may be unnecessary post schema refactor. run tests with this out of the way.
      const properties = { name: info[type] };
      if (type !== 'artist') properties.artist_id = instances[0].id;
      if (type === 'song') properties.album_id = instances[1].id;
      return helpers.findOrCreate(helpers.tableSwitch[type], properties, { slug: helpers.createSlug(helpers.slugSwitch[type]) });
    });
  },

  findOrCreate(info) {
    return module.exports.searchLink(info)
    .then((result) => {
      if (result && result.attributes.spotify_id && result.attributes.apple_id) return result;
      const remainingServices = helpers.services.slice();
      remainingServices.splice(remainingServices.indexOf(info.service), 1);
      return module.exports.fetchRemainingData(info, remainingServices)
      .then(completedInfo => module.exports.createLink(completedInfo))
      .then(createdModel => module.exports.searchLink(info));
    });
  },

  post(req, res) {
    return module.exports.getInfo(req.body.link)
    .then(info => module.exports.findOrCreate(info))
    .then(linkInstance => res.json(linkInstance))
    .catch((err) => {
      console.log('Error in linkController.post:', err);
      res.status(404).render('404');
    });
  },

  get(req, res) {
    const { slug } = req.params;
    return module.exports.searchbySlug(slug)
    .then((link) => {
      const service = req.get('Cookie');
      if (service && service.split('=')[0] === 'service' && helpers.services.includes(service.split('=')[1])) {
        res.redirect(link.attributes[`${service.split('=')[1]}_url`]);
      } else {
        link.attributes.url = req.url;
        res.render('links', helpers.formatLink(link));
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(404).render('404');
    });
  },
};
