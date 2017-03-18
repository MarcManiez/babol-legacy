module.exports = {
  services: ['apple', 'spotify'],
  formatLink: link => JSON.parse(JSON.stringify(link)), // TODO: think of a more efficient way to do this, eh?
  findOrCreate(model, criteria) {
    return model.where(criteria).fetch()
    .then((result) => {
      if (!result) return model.forge(criteria).save(null, { method: 'insert' });
      return result;
    });
  },
  findMissingServices(linkInstance) { // given a group of links, helps us identify which ones are missing
    const services = module.exports.services.slice();
    for (const column in linkInstance) {
      const index = services.indexOf(column);
      if (index >= 0) services.splice(index, 1);
    }
    return services;
  },
};
