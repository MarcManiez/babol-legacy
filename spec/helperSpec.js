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

  describe.only('isMatch', () => {
    it('should return a confidence score >= 80% for two strings that are more than 80% similar', () => {
      expect(helpers.isMatch('Art Blakey & The Jazz Messengers', 'Art Blakey and The Jazz Messengers')).to.be.at.least(0.8);
    });

    it('should return a confidence score < 80% for two strings that are less than 80% similar', () => {
      expect(helpers.isMatch('Art Blakey & The Jazz Messengers', 'Mingus Big Band')).to.be.below(0.8);
    });

    it('should throw an error if the method doesn\'t take two strings', () => {
      expect(helpers.isMatch).to.throw(Error, 'isMatch must take two strings');
    });
  });
});
