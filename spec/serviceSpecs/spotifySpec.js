const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;
chai.use(chaiAsPromised);

const spotify = require('../../server/controllers/servicesController/servicesController').spotify;
const mockData = require('../mockData');

module.exports = () => {
  describe('getLink', () => {
      // TODO: make test ensuring that function is always called with a type property on its params argument.
      // TODO: make test ensuring that function handles empty search results
    it('should retrieve a permalink corresponding to the provided song, if Spotify has it in store', () => {
      const params = { song: 'La danse des canards', type: 'song', album: 'La danse des canards', artist: 'JJ Lionel' };
      return expect(spotify.getLink(params)).to.eventually.equal('https://open.spotify.com/track/6R5tQlnUOLzZkeInNoes1c');
    });

    it('should retrieve a permalink corresponding to the provided song, if Spotify has it in store', () => {
      const params = {
        song: 'The Loss of a Moment',
        type: 'song',
        album: 'Wanton Spirit',
        artist: 'Kenny Barron, Roy Haynes & Charlie Haden',
      };
      return expect(spotify.getLink(params)).to.eventually.equal('https://open.spotify.com/track/0BXjhKdnnRaab6WTk9ZMyY');
    });

    it('should fall back to alternate search patterns if initial search returns no results', () => {
      const params = { song: 'Are You Real', type: 'song', album: 'Moanin\'', artist: 'Art Blakey & The Jazz Messengers' };
      return expect(spotify.getLink(params)).to.eventually.equal('https://open.spotify.com/track/1OGwtlps3T1Fo70q6zZUAs');
    });

    it('should retrieve a permalink corresponding to the provided artist, if Spotify has it in store', () => {
      const params = { song: null, type: 'artist', album: null, artist: 'The Beatles' };
      return expect(spotify.getLink(params)).to.eventually.equal('https://open.spotify.com/artist/3WrFJ7ztbogyGnTHbHJFl2');
    });
  });

  describe('getData', () => {
    it('should retrieve the url, content type, id and content info when given an spotify song url', () => {
      const result = {
        artist: 'Aaron Goldberg',
        song: 'Turkish Moonrise',
        album: 'Turning Point',
        id: '5V3K899uEKvBEiGoxOb04H',
        spotify_id: '5V3K899uEKvBEiGoxOb04H',
        service: 'spotify',
        type: 'song',
        spotify_url: 'https://open.spotify.com/track/5V3K899uEKvBEiGoxOb04H',
      };
      return expect(spotify.getData('https://open.spotify.com/track/5V3K899uEKvBEiGoxOb04H')).to.eventually.eql(result);
    });

    it('should retrieve the url, content type, id and content info when given an spotify album url', () => {
      const result = {
        artist: 'Aaron Goldberg',
        album: 'Turning Point',
        id: '1NYLLZQ0DBSMA6hDjonTnR',
        spotify_id: '1NYLLZQ0DBSMA6hDjonTnR',
        service: 'spotify',
        type: 'album',
        spotify_url: 'https://open.spotify.com/album/1NYLLZQ0DBSMA6hDjonTnR',
      };
      return expect(spotify.getData('https://open.spotify.com/album/1NYLLZQ0DBSMA6hDjonTnR')).to.eventually.eql(result);
    });

    it('should retrieve the url, content type, id and content info when given an spotify artist url', () => {
      const result = {
        artist: 'Aaron Goldberg',
        id: '0BTfBwYC5Mw5ezDg91JBma',
        spotify_id: '0BTfBwYC5Mw5ezDg91JBma',
        service: 'spotify',
        type: 'artist',
        spotify_url: 'https://open.spotify.com/artist/0BTfBwYC5Mw5ezDg91JBma',
      };
      return expect(spotify.getData('https://open.spotify.com/artist/0BTfBwYC5Mw5ezDg91JBma')).to.eventually.eql(result);
    });

    it('should retrieve the url, content type, id and content info when given an spotify artist uri', () => {
      const result = {
        artist: 'Aaron Goldberg',
        id: '0BTfBwYC5Mw5ezDg91JBma',
        spotify_id: '0BTfBwYC5Mw5ezDg91JBma',
        service: 'spotify',
        type: 'artist',
        spotify_url: 'https://open.spotify.com/artist/0BTfBwYC5Mw5ezDg91JBma',
      };
      return expect(spotify.getData('spotify:artist:0BTfBwYC5Mw5ezDg91JBma')).to.eventually.eql(result);
    });
  });

  describe('scan', () => {
    it('should scan a Spotifiy search API response and return a song when there is one to be found', () => {
      const parameters = { song: 'Moanin\'', album: 'Moanin\'', artist: 'Art Blakey & The Jazz Messengers', type: 'song' };
      const answer = spotify.scan(mockData.goodSpotifySongSearch, parameters);
      expect(answer).to.equals('https://open.spotify.com/track/4Vkk3iD1VrENHJEACNddvt');
    });

    it('should scan a Sptofiy search API response and return null when there is no match to be found', () => {
      const parameters = { song: '22', album: 'Red', artist: 'Taylor Swift', type: 'song' };
      try { spotify.scan(mockData.failedSpotifySongSearch, parameters); } catch (error) {
        expect(error).to.eql(new Error('No link was found whose score was high enough'));
      }
    });

    it('should scan a Spotifiy search API response and return an album when there is one to be found', () => {
      const parameters = { album: 'Moanin\'', artist: 'Art Blakey & The Jazz Messengers', type: 'album' };
      const answer = spotify.scan(mockData.goodSpotifyAlbumSearch, parameters);
      expect(answer).to.equals('https://open.spotify.com/album/5PzlTnVafjgt5RtjTdIKoC');
    });

    it('should scan a Spotifiy search API response and return null when there is no album to be found', () => {
      const parameters = { album: 'Red', artist: 'Taylor Swift', type: 'album' };
      try { spotify.scan(mockData.failedSpotifySongSearch, parameters); } catch (error) {
        expect(error).to.eql(new Error('No link was found whose score was high enough'));
      }
    });

    it('should scan a Spotifiy search API response and return an artist when there is one to be found', () => {
      const parameters = { artist: 'Art Blakey & The Jazz Messengers', type: 'artist' };
      const answer = spotify.scan(mockData.goodSpotifyArtistSearch, parameters);
      expect(answer).to.equals('https://open.spotify.com/artist/6ykfXAed2KOLOMI3R0TZdz');
    });

      // it('should scan a Sptofiy search API response and return null when there is no artist to be found', () => {
      //   const parameters = { artist: 'Taylor Swift', type: 'artist' };
      //   const answer = spotify.scan[parameters.type](mockData.failedSpotifyArtistSearch, parameters);
      //   expect(answer).to.be.null;
      // });
  });

  describe('getId', () => {
    it('should retrieve a song id given a valid long form url', () => {
      return expect(spotify.getId('https://open.spotify.com/track/45yEy5WJywhJ3sDI28ajTm'))
        .to.eventually.equal('45yEy5WJywhJ3sDI28ajTm');
    });

    it('should retrieve a album id given a valid long form url', () => {
      return expect(spotify.getId('https://open.spotify.com/album/5XfJmldgWzrc1AIdbBaVZn'))
        .to.eventually.equal('5XfJmldgWzrc1AIdbBaVZn');
    });

    it('should retrieve an artist id given a valid long form url', () => {
      return expect(spotify.getId('https://open.spotify.com/artist/3WrFJ7ztbogyGnTHbHJFl2'))
        .to.eventually.equal('3WrFJ7ztbogyGnTHbHJFl2');
    });

    it('should return an error message given no arguments', () => {
      return expect(spotify.getId()).to.eventually.be.rejected;
    });

    it('should return an error message if the id could not be extracted', () => {
      return expect(spotify.getId('https://itunes.apple.com/us/artist/aaron-goldberg/id5421052/')).to.eventually.be.rejected;
    });
  });

  describe('getInfo', () => {
    it('should retrieve song information given a valid song id', () => {
      const result = {
        artist: 'The Beatles',
        album: 'Abbey Road (Remastered)',
        song: 'Here Comes The Sun - Remastered 2009',
        type: 'song',
        image: { height: 300, url: 'https://i.scdn.co/image/a650b9dadd2b2d66ab9d7788abdcbfab45b2997d', width: 300 },
      };
      return expect(spotify.getInfo({ id: '45yEy5WJywhJ3sDI28ajTm', type: 'track' })).to.eventually.eql(result);
    });

    it('should retrieve album information given a valid album id', () => {
      const image = { height: 300, width: 300, url: 'https://i.scdn.co/image/72d45bffa9869ebf00fcbdda25eb664c819abe64' };
      const result = { artist: 'The Beatles', album: 'Live At The Hollywood Bowl', type: 'album', image };
      return expect(spotify.getInfo({ type: 'album', id: '5XfJmldgWzrc1AIdbBaVZn' })).to.eventually.eql(result);
    });

    it('should retrieve artist information given a valid artist id', () => {
      const image = { height: 200, width: 200, url: 'https://i.scdn.co/image/7fe1a693adc52e274962f1c61d76ca9ccc62c191' };
      const result = { artist: 'The Beatles', type: 'artist', image };
      return expect(spotify.getInfo({ type: 'artist', id: '3WrFJ7ztbogyGnTHbHJFl2' })).to.eventually.eql(result);
    });

    it('should reject requests with invalid ids', () => expect(spotify.getInfo({ id: '5421052abc' })).to.eventually.be.rejected);

    it('should reject requests with non existant ids', () => expect(spotify.getInfo({})).to.eventually.be.rejected);
  });

  describe('selectImage', () => {
    it('should select the most adequate image among a group of Spotify results', () => {
      const imageSet = [{ height: 640,
        url: 'https://i.scdn.co/image/9cab76ad73ce2adbacbd118ebc632255ce7c1841',
        width: 640 },
      { height: 300,
        url: 'https://i.scdn.co/image/a650b9dadd2b2d66ab9d7788abdcbfab45b2997d',
        width: 300 },
      { height: 64,
        url: 'https://i.scdn.co/image/b00a9daeee0a66bd3723d723cce6134cf3c38303',
        width: 64 }];
      return expect(spotify.selectImage(imageSet)).to.eql(imageSet[1]);
    });
  });
};
