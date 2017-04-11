const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;
chai.use(chaiAsPromised);

const services = require('../../server/controllers/servicesController/servicesController');
const mockData = require('../mockData');

module.exports = () => {
  describe('getLink', () => {
      // TODO: make test ensuring that function is always called with a type property on its params argument.
      // TODO: make test ensuring that function handles empty search results
    it('should retrieve a permalink corresponding to the provided song, if Spotify has it in store', () => {
      const params = { song: 'La danse des canards', type: 'song', album: 'La danse des canards', artist: 'JJ Lionel' };
      return expect(services.spotify.getLink(params)).to.eventually.equal('https://open.spotify.com/track/6R5tQlnUOLzZkeInNoes1c');
    });

    it('should retrieve a permalink corresponding to the provided song, if Spotify has it in store', () => {
      const params = {
        song: 'The Loss of a Moment',
        type: 'song',
        album: 'Wanton Spirit',
        artist: 'Kenny Barron, Roy Haynes & Charlie Haden',
      };
      return expect(services.spotify.getLink(params)).to.eventually.equal('https://open.spotify.com/track/0BXjhKdnnRaab6WTk9ZMyY');
    });

    it('should fall back to alternate search patterns if initial search returns no results', () => {
      const params = { song: 'Are You Real', type: 'song', album: 'Moanin\'', artist: 'Art Blakey & The Jazz Messengers' };
      return expect(services.spotify.getLink(params)).to.eventually.equal('https://open.spotify.com/track/1OGwtlps3T1Fo70q6zZUAs');
    });

    it('should retrieve a permalink corresponding to the provided artist, if Spotify has it in store', () => {
      const params = { song: null, type: 'artist', album: null, artist: 'The Beatles' };
      return expect(services.spotify.getLink(params)).to.eventually.equal('https://open.spotify.com/artist/3WrFJ7ztbogyGnTHbHJFl2');
    });
  });

  describe.only('getData', () => {
    it('should retrieve the url, content type, id and content info when given an spotify song url', () => {
      const result = {
        artist: 'Aaron Goldberg',
        song: 'Turkish Moonrise',
        album: 'Turning Point',
        id: '5V3K899uEKvBEiGoxOb04H',
        service: 'spotify',
        type: 'song',
        spotify_url: 'https://open.spotify.com/track/5V3K899uEKvBEiGoxOb04H',
      };
      return expect(services.spotify.getData('https://open.spotify.com/track/5V3K899uEKvBEiGoxOb04H')).to.eventually.eql(result);
    });

    it('should retrieve the url, content type, id and content info when given an spotify album url', () => {
      const result = {
        artist: 'Aaron Goldberg',
        album: 'Turning Point',
        id: '5V3K899uEKvBEiGoxOb04H',
        service: 'spotify',
        type: 'album',
        spotify_url: 'https://open.spotify.com/album/1NYLLZQ0DBSMA6hDjonTnR',
      };
      return expect(services.spotify.getData('https://open.spotify.com/album/1NYLLZQ0DBSMA6hDjonTnR')).to.eventually.eql(result);
    });

    it('should retrieve the url, content type, id and content info when given an spotify artist url', () => {
      const result = {
        artist: 'Aaron Goldberg',
        id: '5V3K899uEKvBEiGoxOb04H',
        service: 'spotify',
        type: 'artist',
        spotify_url: 'https://open.spotify.com/artist/0BTfBwYC5Mw5ezDg91JBma',
      };
      return expect(services.spotify.getData('https://open.spotify.com/artist/0BTfBwYC5Mw5ezDg91JBma')).to.eventually.eql(result);
    });
  });

  describe('scan', () => {
    it('should scan a Spotifiy search API response and return a song when there is one to be found', () => {
      const parameters = { song: 'Moanin\'', album: 'Moanin\'', artist: 'Art Blakey & The Jazz Messengers', type: 'song' };
      const answer = services.spotify.scan(mockData.goodSpotifySongSearch, parameters);
      expect(answer).to.equals('https://open.spotify.com/track/4Vkk3iD1VrENHJEACNddvt');
    });

    it('should scan a Sptofiy search API response and return null when there is no match to be found', () => {
      const parameters = { song: '22', album: 'Red', artist: 'Taylor Swift', type: 'song' };
      try { services.spotify.scan(mockData.failedSpotifySongSearch, parameters); } catch (error) {
        expect(error).to.eql(new Error('No link was found whose score was high enough'));
      }
    });

    it('should scan a Spotifiy search API response and return an album when there is one to be found', () => {
      const parameters = { album: 'Moanin\'', artist: 'Art Blakey & The Jazz Messengers', type: 'album' };
      const answer = services.spotify.scan(mockData.goodSpotifyAlbumSearch, parameters);
      expect(answer).to.equals('https://open.spotify.com/album/5PzlTnVafjgt5RtjTdIKoC');
    });

    it('should scan a Spotifiy search API response and return null when there is no album to be found', () => {
      const parameters = { album: 'Red', artist: 'Taylor Swift', type: 'album' };
      try { services.spotify.scan(mockData.failedSpotifySongSearch, parameters); } catch (error) {
        expect(error).to.eql(new Error('No link was found whose score was high enough'));
      }
    });

    it('should scan a Spotifiy search API response and return an artist when there is one to be found', () => {
      const parameters = { artist: 'Art Blakey & The Jazz Messengers', type: 'artist' };
      const answer = services.spotify.scan(mockData.goodSpotifyArtistSearch, parameters);
      expect(answer).to.equals('https://open.spotify.com/artist/6ykfXAed2KOLOMI3R0TZdz');
    });

      // it('should scan a Sptofiy search API response and return null when there is no artist to be found', () => {
      //   const parameters = { artist: 'Taylor Swift', type: 'artist' };
      //   const answer = services.spotify.scan[parameters.type](mockData.failedSpotifyArtistSearch, parameters);
      //   expect(answer).to.be.null;
      // });
  });

  describe('getId', () => {
    it('should retrieve a song id given a valid long form url', () => {
      expect(services.spotify.getId('https://open.spotify.com/track/45yEy5WJywhJ3sDI28ajTm'))
        .to.eventually.eql({ id: '45yEy5WJywhJ3sDI28ajTm', type: 'track' });
    });

    it('should retrieve a album id given a valid long form url', () => {
      expect(services.spotify.getId('https://open.spotify.com/album/5XfJmldgWzrc1AIdbBaVZn'))
        .to.eventually.eql({ type: 'album', id: '5XfJmldgWzrc1AIdbBaVZn' });
    });

    it('should retrieve an artist id given a valid long form url', () => {
      expect(services.spotify.getId('https://open.spotify.com/artist/3WrFJ7ztbogyGnTHbHJFl2'))
        .to.eventually.eql({ type: 'artist', id: '3WrFJ7ztbogyGnTHbHJFl2' });
    });

    it('should return an error message given no arguments', () => {
      expect(services.spotify.getId()).to.eventually.be.rejected;
    });

    it('should return an error message if the id could not be extracted', () => {
      expect(services.spotify.getId('https://itunes.apple.com/us/artist/aaron-goldberg/id5421052/')).to.eventually.be.rejected;
    });
  });

  describe('getInfo', () => {
    it('should retrieve song information given a valid song id', () => {
      const result = { artist: 'The Beatles', album: 'Abbey Road (Remastered)', song: 'Here Comes The Sun - Remastered 2009', type: 'song' };
      expect(services.spotify.getInfo({ id: '45yEy5WJywhJ3sDI28ajTm', type: 'track' })).to.eventually.eql(result);
    });

    it('should retrieve album information given a valid album id', () => {
      const result = { artist: 'The Beatles', album: 'Live At The Hollywood Bowl', song: null, type: 'album' };
      expect(services.spotify.getInfo({ type: 'album', id: '5XfJmldgWzrc1AIdbBaVZn' })).to.eventually.eql(result);
    });

    it('should retrieve artist information given a valid artist id', () => {
      const result = { artist: 'The Beatles', album: null, song: null, type: 'artist' };
      expect(services.spotify.getInfo({ type: 'artist', id: '3WrFJ7ztbogyGnTHbHJFl2' })).to.eventually.eql(result);
    });

    it('should reject requests with invalid ids', () => expect(services.spotify.getInfo({ id: '5421052abc' })).to.eventually.be.rejected);

    it('should reject requests with non existant ids', () => expect(services.spotify.getInfo({})).to.eventually.be.rejected);
  });
};
