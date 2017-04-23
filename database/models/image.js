const db = require('../../connection').bookshelf;

module.exports = db.Model.extend({
  tableName: 'images',
  hasTimeStamps: true,
  songs() {
    return this.hasMany(require('./song'));
  },
  albums() {
    return this.hasMany(require('./album'));
  },
  artists() {
    return this.hasMany(require('./artist'));
  },
});
