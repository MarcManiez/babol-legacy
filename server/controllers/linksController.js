const Link = require('../../database/models/link');
const helpers = require('./helpers');

module.exports = {
  detectService(link) {
    const error = new Error('Invalid link or unsupported service.');
    if (!link) return error;
    const serviceRegexes = {
      apple: /^https?:\/\/itun\.es\/\S+/g,
      spotify: /^https?:\/\/play\.spotify\.com\/\S+/g,
    };
    for (const service in serviceRegexes) {
      if (link.match(serviceRegexes[service])) return service;
    }
    return error;
  },
  searchLink(link, service) {
    return Link.where({ [service]: link }).fetch({ withRelated: ['artist', 'song', 'album'], require: true })
    .then(linkInstance => helpers.formatLink(linkInstance));
  },
  post(req, res) {
    const link = req.body.link;
    const service = module.exports.detectService(link);
    if (service.constructor === Error) res.status(404).render('404');
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
