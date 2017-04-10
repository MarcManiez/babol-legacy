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
      return expect(helpers.findOrCreate(Album, attributes, { slug: helpers.createSlug() })
      .then(album => album.attributes.name)).to.eventually.equal('this is a test name');
    });

    it('should find a record if it already exists', () => {
      const attributes = { id: 1 };
      return expect(helpers.findOrCreate(Song, attributes).then(song => song.attributes.name)).to.eventually.equal('Fantasy in D');
    });
  });

  describe('createSlug', () => {
    it('should create an 8 character unique identifier', () => {
      expect(helpers.createSlug().length).to.equals(8);
    });
  });

  describe('isMatch', () => {
    it('should return a confidence score >= 80% for two strings that are more than 80% similar', () => {
      expect(helpers.isMatch('Art Blakey & The Jazz Messengers', 'Art Blakey and The Jazz Messengers')).to.be.at.least(0.8);
    });

    it('should return a confidence score of 50% for two strings that are more than 50% similar', () => {
      expect(helpers.isMatch('0000011111', '1111111111')).to.equal(0.5);
    });

    it('should return a confidence score of 0% for two strings with 0 similar characters', () => {
      expect(helpers.isMatch('12345', '67890')).to.equal(0);
    });

    it('should return a confidence score of 20% for two strings with 1 similar characters and a length of 5', () => {
      expect(helpers.isMatch('12345', '17890')).to.equal(0.2);
    });

    it('should return a confidence score of xx% for two strings that are more than xx% similar', () => {
      expect(helpers.isMatch('12345', '67890')).to.equal(0);
    });

    it('should return a confidence score of 60% for two strings that are more than 60% similar', () => {
      expect(helpers.isMatch('1101', '11111')).to.equal(0.6);
    });

    it('should return a confidence score < 80% for two strings that are less than 80% similar', () => {
      expect(helpers.isMatch('Art Blakey & The Jazz Messengers', 'Mingus Big Band')).to.be.below(0.8);
    });

    it('should throw an error if the method doesn\'t take two strings', () => {
      expect(helpers.isMatch).to.throw(Error, 'isMatch must take two strings');
    });
  });
});
