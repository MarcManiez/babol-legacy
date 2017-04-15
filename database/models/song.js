const db = require('../../connection').bookshelf;

module.exports = db.Model.extend({
  tableName: 'songs',
  hasTimeStamps: true,
  artist() {
    return this.belongsTo(require('./artist'));
  },
  album() {
    return this.belongsTo(require('./album'));
  },
  image() {
    return this.belongsTo(require('./image'));
  },
});
