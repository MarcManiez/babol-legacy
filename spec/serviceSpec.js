const chai = require('chai');
const services = require('../server/controllers/servicesController');
const chaiAsPromised = require('chai-as-promised');

const mockData = require('./mockData');

const expect = chai.expect;
chai.use(chaiAsPromised);

// TODO: refactor with chaiAsPromised

describe('Services Controller', () => {
  resetDb();
  describe('Apple', () => {
    describe('getUrl', () => {
      it('should return the long form version of a shared url given a valid link', (done) => {
        services.apple.getUrl('https://itun.es/us/ISGKF?i=529664804')
        .then((url) => { expect(url).to.equal('https://itunes.apple.com/us/album/its-you-i-like/id529664802?i=529664804'); done(); })
        .catch(err => done(err));
      });
    });

    describe('getType', () => {
      it('should return return the link type \'song\' given a valid song link', (done) => {
        services.apple.getType('https://itunes.apple.com/us/album/its-you-i-like/id529664802?i=529664804')
        .then((type) => { expect(type).to.equal('song'); done(); })
        .catch(err => done(err));
      });

      it('should return return the link type \'album\' given a valid song link', (done) => {
        services.apple.getType('https://itunes.apple.com/us/album/turning-point/id425454797')
        .then((type) => { expect(type).to.equal('album'); done(); })
        .catch(err => done(err));
      });

      it('should return return the link type \'artist\' given a valid song link', (done) => {
        services.apple.getType('https://itunes.apple.com/us/artist/aaron-goldberg/id5421052')
        .then((type) => { expect(type).to.equal('artist'); done(); })
        .catch(err => done(err));
      });

      it('should throw an error if a link type cannot be derived', (done) => {
        services.apple.getType('https://itunes.apple.com/us/atist/aaron-goldberg/id5421052')
        .then()
        .catch((err) => { expect(err).to.be.equal('Could not derive type based on provided url.'); done(); });
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

      it('should return an error message given no arguments', (done) => {
        services.apple.getId()
        .then()
        .catch((err) => { expect(err).to.equals('Error: no link provided id.'); done(); });
      });

      it('should return an error message if the id could not be extracted', (done) => {
        services.apple.getId('https://itunes.apple.com/us/artist/aaron-goldberg/id5421052/')
        .then()
        .catch((err) => { expect(err).to.equals('Error: id could not be extracted.'); done(); });
      });
    });
  });

  describe('Spotify', () => {
    describe('getLink', () => {
      // TODO: make test ensuring that function is always called with a type property on its params argument.
      // TODO: make test ensuring that function handles empty search results
      it('should retrieve a permalink corresponding to the provided information, if Spotify has it in store', () => {
        const params = { song: 'La danse des canards', type: 'song', album: 'La danse des canards - Single', artist: 'JJ Lionel' };
        return expect(services.spotify.getLink(params)).to.eventually.equal('https://open.spotify.com/track/2iHRw6k2TSRE9IVQ3mJ8rm');
      });
    });

    describe.only('scan[type]', () => {
      it('should scan a Spotifiy search API response and return a song when there is one to be found', () => {
        const parameters = { song: 'Moanin\'', album: 'Moanin\'', artist: 'Art Blakey & The Jazz Messengers', type: 'song' };
        const answer = services.spotify.scan[parameters.type](mockData.goodSpotifySongSearch, parameters);
        expect(answer).to.equals('https://open.spotify.com/track/4Tq2fWpX1nLCkMSOPkYb1Y');
      });

      it('should scan a Sptofiy search API response and return null when there is no match to be found', () => {
        const parameters = { song: '22', album: 'Red', artist: 'Taylor Swift', type: 'song' };
        const answer = services.spotify.scan[parameters.type](mockData.failedSpotifySongSearch, parameters);
        expect(answer).to.be.null;
      });

      it('should scan a Spotifiy search API response and return an album when there is one to be found', () => {
        const parameters = { album: 'Moanin\'', artist: 'Art Blakey & The Jazz Messengers', type: 'album' };
        const answer = services.spotify.scan[parameters.type](mockData.goodSpotifyAlbumSearch, parameters);
        expect(answer).to.equals('https://open.spotify.com/album/5PzlTnVafjgt5RtjTdIKoC');
      });

      it('should scan a Sptofiy search API response and return null when there is no album to be found', () => {
        const parameters = { album: 'Red', artist: 'Taylor Swift', type: 'album' };
        const answer = services.spotify.scan[parameters.type](mockData.failedSpotifyAlbumSearch, parameters);
        expect(answer).to.be.null;
      });

      it('should scan a Spotifiy search API response and return an artist when there is one to be found', () => {
        const parameters = { artist: 'Art Blakey & The Jazz Messengers', type: 'artist' };
        const answer = services.spotify.scan[parameters.type](mockData.goodSpotifyArtistSearch, parameters);
        expect(answer).to.equals('https://open.spotify.com/artist/6ykfXAed2KOLOMI3R0TZdz');
      });

      // it('should scan a Sptofiy search API response and return null when there is no artist to be found', () => {
      //   const parameters = { artist: 'Taylor Swift', type: 'artist' };
      //   const answer = services.spotify.scan[parameters.type](mockData.failedSpotifyArtistSearch, parameters);
      //   expect(answer).to.be.null;
      // });
    });
  });
});
