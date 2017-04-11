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

  createLink(info) {
    const { type } = info;
    const instances = [];
    return helpers.findOrCreate(Artist, { name: info.artist }, { slug: helpers.createSlug('a') })
    .then((artist) => {
      instances.push(artist);
      return info.album ? helpers.findOrCreate(Album, { name: info.album, artist_id: artist.id }, { slug: helpers.createSlug('c') }) : null;
    })
    .then((album) => {
      instances.push(album);
      const properties = { name: info.song, artist_id: instances[0].id };
      if (album) properties.album_id = album.id;
      return info.song ? helpers.findOrCreate(Song, properties, { slug: helpers.createSlug('s') }) : null;
    })
    .then((song) => {
      instances.push(song);
      const properties = { name: info[type] };
      if (type !== 'artist') properties.artist_id = instances[0].id;
      if (type === 'song') properties.album_id = instances[1].id;
      return helpers.findOrCreate(helpers.tableSwitch[type], properties, { slug: helpers.createSlug(helpers.slugSwitch[type]) });
    });
  },

  searchbySlug(slug) {
    const type = helpers.typeSwitch[slug[0]];
    const model = helpers.tableSwitch[type];
    const options = helpers.withRelatedSwitch[type];
    return model.where({ slug }).fetch({ withRelated: options });
  },

  post(req, res) {
    const link = req.body.link;
    let service;
    let info = {};
    let urls;
    const remainingServices = helpers.services.slice();
    return module.exports.detectService(link)
    .then((musicService) => {
      service = musicService;
      info.service = service;
      remainingServices.splice(remainingServices.indexOf(service), 1);
      return services[service].getUrl(link);
    })
    .then(longUrl => services[service].getId(longUrl))
    .then((id) => {
      info.id = id.id || id;
      return services[service].getInfo(id);
    })
    .then((itemInfo) => {
      info = Object.assign(info, itemInfo);
      return module.exports.searchLink(info);
    })
    .then((linkInstance) => {
      if (linkInstance) return linkInstance; // We've reached a fork in the road
      urls = { [`${service}_url`]: link, [`${service}_id`]: info.id };
      return Promise.all(remainingServices.map(musicService =>  // collect urls from other music services
         services[musicService].getLink(info).then((permaLink) => { urls[`${musicService}_url`] = permaLink; })))
      .then(() => module.exports.createLink(info))
      .then(newLinkInstance => Promise.all(remainingServices.map((musicService) => {
        return services[musicService].getId(urls[`${musicService}_url`])
        .then((id) => { urls[`${musicService}_id`] = id.id || id; });
      }))
        .then(() => newLinkInstance.save(urls)))
      .then(savedLinkInstance => module.exports.searchLink(info));
    })
    .then((linkInstance) => {
      res.json(linkInstance);
    })
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
