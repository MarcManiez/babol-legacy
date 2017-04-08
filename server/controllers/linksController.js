const Link = require('../../database/models/link');
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
    const type = info.type;
    const foreignKeyColumn = `${type}_id`;
    return Promise.all([
      Artist.where({ name: info.artist || null }).fetch(),
      Album.where({ name: info.album || null }).fetch(),
      Song.where({ name: info.song || null }).fetch(),
    ])
    .then((instances) => {
      if (!instances[0]) return null;
      if (type === 'artist') return instances[0];
      else if (type === 'album') return Album.where({ name: info.album, artist_id: instances[0].id }).fetch();
      if (!instances[1]) return null;
      return Song.where({ name: info.song, album_id: instances[1].id, artist_id: instances[0].id }).fetch();
    })
    .then((instance) => {
      if (!instance) return null;
      return Link.where({ [foreignKeyColumn]: instance.id, type }).fetch({ withRelated: ['artist', 'song', 'album'] });
    });
  },

  createLink(info) {
    const instances = [];
    return helpers.findOrCreate(Artist, { name: info.artist })
    .then((artist) => {
      instances.push(artist);
      return info.album ? helpers.findOrCreate(Album, { name: info.album, artist_id: artist.id }) : null;
    })
    .then((album) => {
      instances.push(album);
      const properties = { name: info.song, artist_id: instances[0].id };
      if (album) properties.album_id = album.id;
      return info.song ? helpers.findOrCreate(Song, properties) : null;
    })
    .then((song) => {
      instances.push(song);
      const properties = { type: info.type, artist_id: instances[0].id };
      if (instances[1]) properties.album_id = instances[1].id;
      if (song) properties.song_id = song.id;
      return helpers.findOrCreate(Link, properties);
    });
  },

  post(req, res) {
    const link = req.body.link;
    let service;
    let info;
    let linkGroup;
    let links;
    const remainingServices = helpers.services.slice();
    return module.exports.detectService(link)
    .then((musicService) => {
      service = musicService;
      remainingServices.splice(remainingServices.indexOf(service), 1);
      return services[service].getUrl(link);
    })
    .then(longUrl => services[service].getId(longUrl))
    .then(id => services[service].getInfo(id))
    .then((itemInfo) => {
      info = itemInfo;
      return module.exports.searchLink(info);
    })
    .then((linkInstance) => {
      linkGroup = linkInstance;
      if (linkInstance) return linkInstance; // We've reached a fork in the road
      links = { [service]: link };
      return Promise.all(remainingServices.map(musicService =>  // collect links from other music services
         services[musicService].getLink(info).then((permaLink) => { links[musicService] = permaLink; })))
      .then(() => module.exports.createLink(info))
      .then(newLinkInstance => newLinkInstance.save(links))
      .then(savedLinkInstance => module.exports.searchLink(info));
    })
    .then(linkInstance => res.json(linkInstance))
    .catch((err) => {
      console.log('Error in linkController.post:', err);
      res.status(404).render('404');
    });
  },

  get(req, res) {
    const { id } = req.params;
    return Link.where({ id }).fetch({ withRelated: ['artist', 'song', 'album'] })
    .then((link) => {
      const service = req.get('Cookie');
      if (service && service.split('=')[0] === 'service' && helpers.services.includes(service.split('=')[1])) {
        res.redirect(link.attributes[service.split('=')[1]]);
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
