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
    const string1Reduced = module.exports.reduce(string1);
    const string2Reduced = module.exports.reduce(string2);
    let totalDifference = 0;
    let contained = null;
    let longest = string2.length > string1.length ? string2Reduced : string1Reduced;
    if (string1.length === string2.length) {
      longest = Object.keys(string1Reduced) > Object.keys(string2Reduced) ? string1Reduced : string2Reduced;
    }
    const shortest = longest === string2Reduced ? string1Reduced : string2Reduced;
    const longestLength = string2.length > string1.length ? string2.length : string1.length;
    if (string1.indexOf(string2) >= 0) contained = +(string2.length / string1.length).toFixed(2);
    if (string2.indexOf(string1) >= 0) contained = +(string1.length / string2.length).toFixed(2);
    for (const letter in longest) {
      totalDifference += Math.abs((longest[letter] || 0) - (shortest[letter] || 0));
    }
    const score = +((longestLength - totalDifference) / longestLength).toFixed(2);
    return score >= contained ? score : contained;
  },

  reduce(string) {
    return string.split('').reduce((prev, curr) => {
      prev[curr] = prev[curr] + 1 || 1;
      return prev;
    }, {});
  },
};
