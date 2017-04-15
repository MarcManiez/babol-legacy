const db = require('../../connection').bookshelf;

module.exports = db.Model.extend({
  tableName: 'artists',
  hasTimeStamps: true,
  songs() {
    return this.hasMany(require('./song'));
  },
  albums() {
    return this.hasMany(require('./album'));
  },
  image() {
    return this.belongsTo(require('./image'));
  },
});
