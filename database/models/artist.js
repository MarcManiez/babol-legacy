const db = require('../../connection');
const Song = require('./song');
const Link = require('./link');
const Album = require('./album');

module.exports = db.Model.extend({
  tableName: 'artists',
  hasTimeStamps: true,
  songs() {
    return this.hasMany(Song);
  },
  albums() {
    return this.hasMany(Album);
  },
  links() {
    return this.hasMany(Link);
  },
});
