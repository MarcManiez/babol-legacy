const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;
chai.use(chaiAsPromised);

const services = require('../../server/controllers/servicesController/servicesController');
const mockData = require('../mockData');

module.exports = () => {
  describe('getUrl', () => {
    it('should return the long form version of a shared url given a valid link', (done) => {
      services.apple.getUrl('https://itun.es/us/ISGKF?i=529664804')
        .then((url) => { expect(url).to.equal('https://itunes.apple.com/us/album/its-you-i-like/id529664802?i=529664804'); done(); })
        .catch(err => done(err));
    });
  });

  describe('getType', () => {
    it('should return return the link type \'song\' given a valid song link', () => {
      return expect(services.apple.getType('https://itunes.apple.com/us/album/its-you-i-like/id529664802?i=529664804'))
      .to.eventually.equal('song');
    });

    it('should return return the link type \'album\' given a valid song link', () => {
      return expect(services.apple.getType('https://itunes.apple.com/us/album/turning-point/id425454797'))
      .to.eventually.equal('album');
    });

    it('should return return the link type \'artist\' given a valid song link', () => {
      return expect(services.apple.getType('https://itunes.apple.com/us/artist/aaron-goldberg/id5421052'))
      .to.eventually.equal('artist');
    });

    it('should throw an error if a link type cannot be derived', () => {
      return expect(services.apple.getType('https://itunes.apple.com/us/atist/aaron-goldberg/id5421052'))
      .to.eventually.be.rejected;
    });
  });

  describe('getInfo', () => {
    it('should retrieve song information given a valid song id', (done) => {
      const result = { artist: 'Aaron Goldberg', album: 'Turning Point', song: 'Fantasy in D', type: 'song' };
      services.apple.getInfo('425454830')
        .then((info) => { expect(info).to.eql(result); done(); })
        .catch(err => done(err));
    });

    it('should retrieve album information given a valid album id', (done) => {
      const result = { artist: 'Aaron Goldberg', album: 'Turning Point', type: 'album' };
      services.apple.getInfo('425454797')
        .then((info) => { expect(info).to.eql(result); done(); })
        .catch(err => done(err));
    });

    it('should retrieve artist information given a valid artist id', (done) => {
      const result = { artist: 'Aaron Goldberg', type: 'artist' };
      services.apple.getInfo('5421052')
        .then((info) => { expect(info).to.eql(result); done(); })
        .catch(err => done(err));
    });

    it('should reject requests with invalid ids', () => expect(services.apple.getInfo('5421052abc')).to.eventually.be.rejected);

    it('should reject requests with non existant ids', () => expect(services.apple.getInfo()).to.eventually.be.rejected);
  });

  describe('getId', () => {
    it('should retrieve a song id given a valid long form url', (done) => {
      services.apple.getId('https://itunes.apple.com/us/album/turning-point/id425454797?i=425454830')
        .then((id) => { expect(id).to.equal('425454830'); done(); })
        .catch(err => done(err));
    });

    it('should retrieve a album id given a valid long form url', (done) => {
      services.apple.getId('https://itunes.apple.com/us/album/turning-point/id425454797')
        .then((id) => { expect(id).to.equal('425454797'); done(); })
        .catch(err => done(err));
    });

    it('should retrieve an artist id given a valid long form url', (done) => {
      services.apple.getId('https://itunes.apple.com/us/artist/aaron-goldberg/id5421052')
        .then((id) => { expect(id).to.equal('5421052'); done(); })
        .catch(err => done(err));
    });

    it('should return an error message given no arguments', () => expect(services.apple.getId()).to.eventually.be.rejected);

    it('should return an error message if the id could not be extracted', () => {
      return expect(services.apple.getId('https://itunes.apple.com/us/artist/aaron-goldberg/id5421052/'))
      .to.eventually.be.rejected;
    });
  });

  describe('getData', () => {
    it('should retrieve the url, content type, id and content info when given an apple song url', () => {
      const result = {
        artist: 'Aaron Goldberg',
        song: 'Turkish Moonrise',
        album: 'Turning Point',
        id: '425454835',
        service: 'apple',
        type: 'song',
        apple_url: 'https://itun.es/us/nZ-wz?i=425454835',
      };
      return expect(services.apple.getData('https://itun.es/us/nZ-wz?i=425454835')).to.eventually.eql(result);
    });

    it('should retrieve the url, content type, id and content info when given an apple album url', () => {
      const result = {
        artist: 'Aaron Goldberg',
        album: 'Turning Point',
        id: '425454797',
        service: 'apple',
        type: 'album',
        apple_url: 'https://itun.es/us/nZ-wz',
      };
      return expect(services.apple.getData('https://itun.es/us/nZ-wz')).to.eventually.eql(result);
    });

    it('should retrieve the url, content type, id and content info when given an apple artist url', () => {
      const result = {
        artist: 'Aaron Goldberg',
        id: '5421052',
        service: 'apple',
        type: 'artist',
        apple_url: 'https://itun.es/us/8FRu',
      };
      return expect(services.apple.getData('https://itun.es/us/8FRu')).to.eventually.eql(result);
    });
  });

  describe('scan', () => {
    it('should scan an apple search API response and return a song when there is one to be found', () => {
      const parameters = { song: 'Moanin\'', album: 'Moanin\'', artist: 'Art Blakey & The Jazz Messengers', type: 'song' };
      const answer = services.apple.scan(mockData.goodAppleSongSearch, parameters);
      expect(answer).to.equals('https://itunes.apple.com/us/album/moanin/id725816184?i=725816540&uo=4');
    });

    it('should scan an apple search API response and return an album when there is one to be found', () => {
      const parameters = { song: null, album: 'Moanin\'', artist: 'Art Blakey & The Jazz Messengers', type: 'album' };
      const answer = services.apple.scan(mockData.goodAppleAlbumSearch, parameters);
      expect(answer).to.equals('https://itunes.apple.com/us/album/moanin-remastered/id725816184?uo=4');
    });

    it('should scan an apple search API response and return an artist when there is one to be found', () => {
      const parameters = { song: null, album: null, artist: 'Art Blakey & The Jazz Messengers', type: 'artist' };
      const answer = services.apple.scan(mockData.goodAppleArtistSearch, parameters);
      expect(answer).to.equals('https://itunes.apple.com/us/artist/art-blakey-the-jazz-messengers/id999447?uo=4');
    });
  });
};
