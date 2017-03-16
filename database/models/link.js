const db = require('../../connection');
const Artist = require('./artist');
const Album = require('./album');
const Song = require('./song');

module.exports = db.Model.extend({
  tableName: 'links',
  hasTimeStamps: true,
  song() {
    return this.belongsTo(Song);
  },
  album() {
    return this.belongsTo(Album);
  },
  artist() {
    return this.belongsTo(Artist);
  },
});
