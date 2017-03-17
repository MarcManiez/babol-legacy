const Link = require('../../database/models/link');
const helpers = require('./helpers');

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

  searchLink(link, service) {
    return Link.where({ [service]: link }).fetch({ withRelated: ['artist', 'song', 'album'] })
    .then(linkInstance => helpers.formatLink(linkInstance));
  },

  post(req, res) { // TODO: needs tests
    const link = req.body.link;
    return module.exports.detectService(link)
    .then(service => module.exports.searchLink(link, service))
    .then((linkInstance) => {
      res.render('links', linkInstance);
    })
    .catch((err) => {
      res.status(404).render('404');
    });
  },
};
