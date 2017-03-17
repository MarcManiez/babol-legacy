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

  searchLink(link, service) { // TODO: this needs to be remade into a manual promise to reject when there are too few arguments.
    return Link.where({ [service]: link }).fetch({ withRelated: ['artist', 'song', 'album'], require: true }) // TODO: empty responses need to be thenable.
    .then(linkInstance => helpers.formatLink(linkInstance));
  },

  post(req, res) {
    const link = req.body.link;
    const service = module.exports.detectService(link);
    if (service.constructor === Error) res.status(404).render('404'); // TODO: this needs to be a promise. You'll have to redo your tests.
    return module.exports.searchLink(link, service)
    .then((linkInstance) => {
      console.log('LINKINSTANCE', linkInstance);
      res.render('links', linkInstance);
    })
    .catch((err) => {
      res.status(404).render('404');
    });
  },
};
