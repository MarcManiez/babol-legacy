const Link = require('../../database/models/link');
const Artist = require('../../database/models/artist');
const Album = require('../../database/models/album');
const Song = require('../../database/models/song');
const helpers = require('./helpers');

const services = require('./servicesController');

module.exports = {
  detectService(link) {
    return new Promise((resolve, reject) => {
      const error = new Error('Invalid link or unsupported service.');
      if (!link) reject(error);
      const serviceRegexes = {
        apple: /^https?:\/\/itun\.es\/\S+/g,
        spotify: /^https?:\/\/play\.spotify\.com\/\S+/g,
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
      Artist.where({ name: info.artist }).fetch(),
      Album.where({ name: info.album }).fetch(),
      Song.where({ name: info.song }).fetch(),
    ])
    .then((instances) => {
      if (type === 'artist') return instances[0];
      else if (type === 'album') return Album.where({ name: info.album, artist_id: instances[0].id });
      return Song.where({ name: info.song, album_id: instances[1].id, artist_id: instances[0].id }).fetch();
    })
    .then((instance) => {
      if (!instance) return null;
      return Link.where({ [foreignKeyColumn]: instance.id, type }).fetch({ withRelated: ['artist', 'song', 'album'] });
    });
  },

  post(req, res) {
    const link = req.body.link;
    let service;
    let info;
    return module.exports.detectService(link)
    .then((musicService) => {
      service = musicService;
      return services[service].getUrl(link);
    })
    .then(longUrl => services[service].getId(longUrl))
    .then(id => services[service].getInfo(id))
    .then((itemInfo) => {
      info = itemInfo;
      return module.exports.searchLink(info);
    })
    .then((linkInstance) => {
      // do we have a link instance for this item? ==> make a link controller method for this purpose only ==> need type and content name
      if (linkInstance) {
        // if so, find all the missing services UNCOMMENT BELOW
        // return Promise.all(helpers.findMissingServices(linkInstance).map((musicService) => {
        //   return services[musicService].getLink(info).then(permaLink => linkInstance.save({ [service]: permaLink }));
        // }))
        // .then(() => res.render('links', helpers.formatLink(linkInstance))); // add tests to reflect the newly fetched spotify link
        res.render('links', helpers.formatLink(linkInstance));
      }
      // return Promise.all(...);
      // if not, create the link instance (findOrCreate all the songs / artists / albums), get their IDs. PROBABLY make a helper method for this.
      // populate all the missing links
    })
    .catch((err) => {
      res.status(404).render('404');
    });
  },
};
