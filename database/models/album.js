const db = require('../../connection').bookshelf;

module.exports = db.Model.extend({
  tableName: 'albums',
  hasTimeStamps: true,
  artist() {
    return this.belongsTo(require('./artist'));
  },
  songs() {
    return this.hasMany(require('./song'));
  },
  image() {
    return this.belongsTo(require('./image'));
  },
});
