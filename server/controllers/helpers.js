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
    string1 = string1.toLocaleLowerCase();
    string2 = string2.toLocaleLowerCase();
    const string1Reduced = module.exports.reduce(string1);
    const string2Reduced = module.exports.reduce(string2);
    let totalDifference = 0;
    let alternateScore = null;
    let longest = string2.length > string1.length ? string2Reduced : string1Reduced;
    if (string1.length === string2.length) {
      longest = Object.keys(string1Reduced) > Object.keys(string2Reduced) ? string1Reduced : string2Reduced;
    }
    const shortest = longest === string2Reduced ? string1Reduced : string2Reduced;
    const longestLength = string2.length > string1.length ? string2.length : string1.length;
    if (string1.includes(string2) || string2.includes(string1)) {
      alternateScore = string1.includes(string2) ? string2.length / string1.length : string1.length / string2.length;
      let remainder = 1 - alternateScore;
      alternateScore *= 1 + remainder;
      remainder = 1 - alternateScore;
      if (string1.includes('edition') || string1.includes('remastered')) {
        alternateScore *= 1 + remainder;
        remainder = 1 - alternateScore;
      }
      alternateScore = +alternateScore.toFixed(2);
    }
    for (const letter in longest) {
      totalDifference += Math.abs((longest[letter] || 0) - (shortest[letter] || 0));
    }
    const score = +((longestLength - totalDifference) / longestLength).toFixed(2);
    return score >= alternateScore ? score : alternateScore;
  },

  reduce(string) {
    return string.split('').reduce((prev, curr) => {
      prev[curr] = prev[curr] + 1 || 1;
      return prev;
    }, {});
  },
};
