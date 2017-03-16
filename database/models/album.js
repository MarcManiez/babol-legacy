const db = require('../../connection');
const Artist = require('./artist');
const Link = require('./link');
const Song = require('./song');

module.exports = db.Model.extend({
  tableName: 'albums',
  hasTimeStamps: true,
  artist() {
    return this.belongsTo(Artist);
  },
  songs() {
    return this.hasMany(Song);
  },
  links() {
    return this.hasMany(Link);
  },
});
