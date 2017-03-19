const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const helpers = require('../server/controllers/helpers');
const Album = require('../database/models/album');
const Song = require('../database/models/song');

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('Helper methods', () => {
  resetDb();

  describe('findOrCreate', () => {
    it('should create a record if it does not exist', () => {
      const attributes = { name: 'this is a test name', artist_id: 1 };
      return expect(helpers.findOrCreate(Album, attributes).then(album => album.attributes.name)).to.eventually.equal('this is a test name');
    });

    it('should find a record if it already exists', () => {
      const attributes = { id: 1 };
      return expect(helpers.findOrCreate(Song, attributes).then(song => song.attributes.name)).to.eventually.equal('Fantasy in D');
    });
  });
});
