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

  isMatch(string1, string2) {
    if (!string1 || !string2 || typeof string1 !== 'string' || typeof string2 !== 'string') throw new Error('isMatch must take two strings');
    if (string1 === string2) return 1;
    let totalDifference = 0;
    let longest = string2.length > string1.length ? string2 : string1;
    let shortest = longest === string2 ? string1 : string2;
    const longestLength = longest.length;
    if (longest.indexOf(shortest >= 0)) return +((longest.length - shortest.length) / longest.length).toFixed(2);
    longest = module.exports.reduce(longest);
    shortest = module.exports.reduce(shortest);
    for (const letter in longest) {
      totalDifference += Math.abs((longest[letter] || 0) - (shortest[letter] || 0));
    }
    return +((longestLength - totalDifference) / longestLength).toFixed(2);
  },

  reduce(string) {
    return string.split('').reduce((prev, curr) => {
      prev[curr] = prev[curr] + 1 || 1;
      return prev;
    }, {});
  },
};
