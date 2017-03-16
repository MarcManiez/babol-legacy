const Link = require('../../database/models/link');

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
    return new Promise((resolve, reject) => {
      if (arguments.length <= 1) reject(new Error('Invalid link or unsupported service.'));
      Link.where({ [service]: link }).fetch({ withRelated: ['artist', 'song', 'album'] })
      .then((linkInstance) => {
        // console.log(JSON.parse(JSON.stringify(linkInstance)));
        console.log('LINK INSTANCE', linkInstance);
        if (linkInstance === null) reject(linkInstance);
        else {
          resolve(linkInstance);
        }
      })
      .catch((err) => {
        reject(err);
      });
    });
  },
};
