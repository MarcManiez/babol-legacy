module.exports = {
  services: ['apple', 'spotify'],
  formatLink: link => JSON.parse(JSON.stringify(link)), // TODO: think of a more efficient way to do this, eh?
  findOrCreate(model, criteria) { // TODO: write some tests for this
    return model.where(criteria).fetch()
    .then((result) => {
      if (!result) return model.forge(criteria).save();
      return result;
    });
  },
  findMissingServices(linkInstance) {

  },
};
