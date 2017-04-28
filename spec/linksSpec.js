const axios = require('axios');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const cleaner = require('knex-cleaner');
const request = require('supertest');
const server = require('../server/server');
const config = require('../knexfile');
const db = require('../connection').bookshelf;
const linksController = require('../server/controllers/linksController');
const Artist = require('../database/models/artist');
const Album = require('../database/models/album');
const Song = require('../database/models/song');

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('Links Controler', () => {
  resetDb();

  const error = new Error('Invalid link or unsupported service.');
  describe('detectService', () => {
    const detectService = linksController.detectService;
    it('should return an error if no link is provided', () => {
      expect(detectService()).to.eventually.be.rejected;
    });

    it('should correctly detect valid apple links', () => {
      expect(detectService('https://itun.es/us/8FRu')).to.eventually.equal('apple');
    });

    it('should correctly detect valid play.spotify links', () => {
      expect(detectService('https://play.spotify.com/artist/0BTfBwYC5Mw5ezDg91JBma')).to.eventually.equal('spotify');
    });

    it('should correctly detect valid play.spotify links', () => {
      expect(detectService('https://open.spotify.com/track/4JehYebiI9JE8sR8MisGVb')).to.eventually.equal('spotify');
    });

    it('should correctly detect invalid links', () => {
      expect(detectService('https://iun.e/us/8FRu')).to.eventually.be.rejected;
    });
  });

  describe('searchLink', () => {
    it('should find a matching record (with related entities) if such a record exists', () => {
      const searchCriteria = {
        type: 'song',
        service: 'spotify',
        song: 'Fantasy in D',
        album: 'Turning Point',
        artist: 'Aaron Goldberg',
        id: '2OWKDnQje6CyuUHtOWVuD9' };
      return linksController.searchLink(searchCriteria)
      .then((linkInstance) => {
        expect(linkInstance.attributes.name).to.equal('Fantasy in D');
        expect(linkInstance.relations.artist.attributes.name).to.equal('Aaron Goldberg');
        expect(linkInstance.relations.album.attributes.name).to.equal('Turning Point');
      });
    });

    it('should resolve to null if a matching record does not exist', () => {
      const searchCriteria = { type: 'song', artist: 'test', album: 'test', song: 'La Zoubida', service: 'spotify', id: 4 };
      expect(linksController.searchLink(searchCriteria)).to.eventually.be.null;
    });
  });

  describe('createLink', () => {
    // /!\ I am only testing this with songs for now. I have to hope this will also work for albums and artists
    it('should create a new entry with completely new artist, album, and song info', () => {
      const info = { type: 'song', song: 'A la queue leu leu', artist: 'La Bande à Basile', album: 'Double d\'Or: La Bande à Basile', service: 'apple', apple_id: '566073435', apple_song_id: '566073435', apple_artist_id: '16685695', apple_album_id: '566073177' };
      return expect(linksController.createLink(info).then(song => song.attributes.name)).to.eventually.equals(info.song);
    });

    it('should create a new entry with pre-existing artist, album, and song info', () => {
      const info = { type: 'song', song: 'Turkish Moonrise', artist: 'Aaron Goldberg', album: 'Turning Point', service: 'apple', apple_id: '566073435', apple_song_id: '566073435', apple_artist_id: '16685695', apple_album_id: '566073177' };
      return expect(linksController.createLink(info).then(song => song.attributes.name)).to.eventually.equals(info.song);
    });
  });

  describe('searchBySlug', () => {
    it('should find a record and return its related items based on a provided slug', () => {
      const task = linksController.searchbySlug('c12345678');
      return expect(task).to.eventually.have.deep.property('attributes.name', 'Turning Point');
    });
  });

  describe('getInfo', () => {
    it('should retrieve the url, content type, id and content info when given an apple song url', () => {
      const result = {
        artist: 'Aaron Goldberg',
        song: 'Turkish Moonrise',
        album: 'Turning Point',
        id: '425454835',
        apple_id: '425454835',
        service: 'apple',
        type: 'song',
        apple_url: 'https://itun.es/us/nZ-wz?i=425454835',
      };
      return expect(linksController.getInfo('https://itun.es/us/nZ-wz?i=425454835')).to.eventually.eql(result);
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
        image: { width: 300, height: 300, url: 'https://i.scdn.co/image/522ab1fc1beac641c1dd2fbac4d3f7aa9818c5a4' },
        image_id: 1,
      };
      return expect(linksController.getInfo('https://open.spotify.com/album/1NYLLZQ0DBSMA6hDjonTnR')).to.eventually.eql(result);
    });
  });

  describe.only('post', () => {
    it('should load a page with the correct content given a previously existing link', () => {
      return request(server).post('/api/link').send({ link: 'https://itun.es/us/nZ-wz?i=425454830' })
      .then(response => expect(response.body.name).to.equal('Fantasy in D'));
    });

    it('should fetch missing links given a brand new apple link', () => {
      return request(server).post('/api/link').send({ link: 'https://itun.es/us/kQRMj?i=161135249' })
      .then(response => expect(response.body.spotify_id).to.equal('6R5tQlnUOLzZkeInNoes1c'));
    });

    it('should fetch missing links given a brand new apple artist link', () => {
      return expect(request(server).post('/api/link').send({ link: 'https://itun.es/us/pCH' }))
      .to.eventually.have.deep.property('body.name', 'The Beatles');
    });

    it('should fetch missing links given a brand new apple album link', () => {
      return expect(request(server).post('/api/link').send({ link: 'https://itun.es/us/0rm8C' }))
      .to.eventually.have.deep.property('body.name', 'Getz/Gilberto');
    });

    it('should fetch missing links given a brand new spotify track link', () => {
      const task = request(server).post('/api/link').send({ link: 'https://open.spotify.com/track/0IDoJJD5rea4Em9JZA8Wh2' });
      const url = 'https://itunes.apple.com/us/album/el-negro-del-blanco/id448538868?i=448538886&uo=4';
      return Promise.all([
        expect(task).to.eventually.have.deep.property('body.apple_url', url),
        expect(task).to.eventually.have.deep.property('body.artist.name', 'Yamandú Costa'),
      ]);
    });

    it('should fetch missing links given a brand new spotify artist link', () => {
      const task = request(server).post('/api/link').send({ link: 'https://open.spotify.com/artist/3pO5VjZ4wOHCMBXOvbMISG' });
      const url = 'https://itunes.apple.com/us/artist/ant%C3%B4nio-carlos-jobim/id201663245?uo=4';
      return expect(task).to.eventually.have.deep.property('body.apple_url', url);
    });

    it('should fetch an entry given a search for a name that is present multiple times in the database', function () {
      this.timeout(10000);
      return expect(request(server).post('/api/link').send({ link: 'https://itun.es/us/djGbr?i=285606958' })
      .then(() => request(server).post('/api/link').send({ link: 'https://itun.es/us/djGbr?i=285606968' })))
      .to.eventually.have.deep.property('body.artist.name', 'Chick Corea, Stan Getz & Bill Evans');
    });

    it('should retrieve the correct album after having already stored a song from that album', function () {
      this.timeout(10000);
      return expect(request(server).post('/api/link').send({ link: 'https://itun.es/us/nCTuB?i=458413936' })
      .then(() => request(server).post('/api/link').send({ link: 'https://itun.es/us/nCTuB' })))
      .to.eventually.have.deep.property('body.apple_id', '458413837');
    });

    it('should retrieve the correct artist after having already stored an album from that artist', function () {
      this.timeout(10000);
      return expect(request(server).post('/api/link').send({ link: 'https://itun.es/us/nCTuB' })
      .then(() => request(server).post('/api/link').send({ link: 'https://itun.es/us/5DPXd' })))
      .to.eventually.have.deep.property('body.apple_id', '63346553');
    });

  // debugging

    // it.only('should help me figure things out', function () {
    //   this.timeout(10000);
    //   return expect(request(server).post('/api/link').send({ link: 'https://itun.es/us/nCTuB?i=458413936' }).then((lol) => {
    //     console.log(lol);
    //     return lol;
    //   }))
    //   .to.eventually.not.be.null;
    // });
  });

  describe('get', () => {
    it('should serve a babol links page if there is no cookie present in the request', () => {
      return expect(request(server).get('/link/s12345678').then(response => response.redirect)).to.eventually.be.false;
    });

    it('should serve a babol links page if there is no service cookie present in the request', () => {
      return expect(request(server).get('/link/s12345678').set('Cookie', 'notService=test')
      .then(response => response.redirect)).to.eventually.be.false;
    });

    it('should redirect to the related service if there is a service cookie present in the request', () => {
      return expect(request(server).get('/link/s12345678').set('Cookie', 'service=apple')
      .then(response => response.redirect)).to.eventually.be.true;
    });

    it('should serve a babol links page if there is a service cookie present for an unsupported service', () => {
      return expect(request(server).get('/link/s12345678').set('Cookie', 'service=musicIsSoCool')
      .then(response => response.redirect)).to.eventually.be.false;
    });
  });
});
