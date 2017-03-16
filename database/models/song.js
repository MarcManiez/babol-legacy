const db = require('../../connection');
const Artist = require('./artist');
const Album = require('./album');
const Link = require('./link');

module.exports = db.Model.extend({
  tableName: 'songs',
  hasTimeStamps: true,
  artist() {
    return this.belongsTo(Artist);
  },
  album() {
    return this.belongsTo(Album);
  },
  link() {
    return this.belongsTo(Link);
  },
});
