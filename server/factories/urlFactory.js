const serviceRegexes = {
  apple: /^https?:\/\/itun\.es\/\S+/g,
  spotify: /^https?:\/\/play\.spotify\.com\/\S+/g,
};

module.exports = {
  detectService(link) {
    for (const service in serviceRegexes) {
      if (link.match(serviceRegexes[service])) return service;
    }
    return new Error('Invalid link or unsupported service.');
  },
};
