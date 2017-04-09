const db = require('../../connection');
const Song = require('./song');
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
});
