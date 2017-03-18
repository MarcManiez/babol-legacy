const axios = require('axios');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const linksController = require('../server/controllers/linksController');
const Link = require('../database/models/link');
const Artist = require('../database/models/artist');
const Album = require('../database/models/album');
const Song = require('../database/models/song');

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('Links Controler', () => {
  const error = new Error('Invalid link or unsupported service.');
  describe('detectService', () => {
    const detectService = linksController.detectService;
    it('should return an error if no link is provided', (done) => {
      detectService().then()
      .catch((err) => { expect(err).to.eql(error); done(); });
    });

    it('should correctly detect valid apple links', (done) => {
      detectService('https://itun.es/us/8FRu')
      .then((service) => { expect(service).to.equal('apple'); done(); })
      .catch(err => done(err));
    });

    it('should correctly detect valid spotify links', (done) => {
      detectService('https://play.spotify.com/artist/0BTfBwYC5Mw5ezDg91JBma')
      .then((service) => { expect(service).to.equal('spotify'); done(); })
      .catch(err => done(err));
    });

    it('should correctly detect invalid links', (done) => {
      detectService('https://iun.e/us/8FRu').then()
      .catch((err) => { expect(err).to.eql(error); done(); })
      .catch(err => done(err));
    });
  });

  describe('searchLink', () => {
    before(() => Link.where({ type: 'song', apple: 'https://itun.es/us/kD24B?i=467888110' }).destroy());
    after(() => Link.where({ type: 'song', apple: 'https://itun.es/us/kD24B?i=467888110' }).destroy());

    it('should find a matching record (with related entities) if such a record exists', (done) => {
      linksController.searchLink({ type: 'song', song: 'Fantasy in D', album: 'Turning Point', artist: 'Aaron Goldberg' })
      .then((linkInstance) => {
        expect(linkInstance.attributes.spotify).to.equal('https://open.spotify.com/track/2OWKDnQje6CyuUHtOWVuD9');
        expect(linkInstance.attributes.apple).to.equal('https://itun.es/us/nZ-wz?i=425454830');
        expect(linkInstance.relations.artist.attributes.name).to.equal('Aaron Goldberg');
        expect(linkInstance.relations.album.attributes.name).to.equal('Turning Point');
        expect(linkInstance.relations.song.attributes.name).to.equal('Fantasy in D');
        done();
      })
      .catch(err => done(err));
    });

    it('should resolve to null if a matching record does not exist', () => {
      expect(linksController.searchLink({ type: 'song', song: 'La Zoubida' })).to.eventually.be.null;
    });
  });

  xdescribe('createLink', () => {
    after(() => {
      const records = [];
      return Artist.where({ name: 'La Bande à Basile' }).fetch().then(artist => records.push(artist))
      .then(() => Album.where({ name: 'Double d\'Or: La Bande à Basile' }).fetch().then(album => records.push(album)))
      .then(() => Song.where({ name: 'A la queue leu leu' }).fetch().then(song => records.push(song)))
      .then(() => Link.where({ type: 'song', song_id: records[2].id }).fetch().then(link => records.push(link)))
      .then(() => records.pop().destroy().then(() => records.pop().destroy()).then(() => records.pop().destroy()).then(() => records.pop().destroy()));
      // .then(() => { console.log('RECORDS YO!', records.reverse()); return Promise.all(records.reverse().map(record => record.destroy()))});
    });

    after(() => Song.where({ name: 'Turkish Moonrise' }).fetch()
    .then(song => Link.where({ type: 'song', song_id: song.id }).destroy().then(() => song.destroy())));

    // /!\ I am only testing this with songs for now. I have to hope this will also work for albums and artists
    it('should create a new entry with completely new artist, album, and song info', (done) => {
      const info = { type: 'song', song: 'A la queue leu leu', artist: 'La Bande à Basile', album: 'Double d\'Or: La Bande à Basile' };
      linksController.createLink(info)
      .then((song) => { expect(song.attributes.type).to.equals(info.type); done(); })
      .catch(err => done(err));
    });

    it('should create a new entry with pre-existing artist, album, and song info', (done) => {
      const info = { type: 'song', song: 'Turkish Moonrise', artist: 'Aaron Goldberg', album: 'Turning Point' };
      linksController.createLink(info)
      .then((song) => { expect(song.attributes.type).to.equals(info.type); done(); })
      .catch(err => done(err));
    });
  });

  xdescribe('post', () => {
    before(() => Link.where({ type: 'song', apple: 'https://itun.es/us/kQRMj?i=161135249' }).destroy());
    after(() => Link.where({ type: 'song', apple: 'https://itun.es/us/kQRMj?i=161135249' }).destroy());

    it('should load a page with the correct content given an previously existing link', (done) => {
      axios.post('http://localhost:8000/api/link', { link: 'https://itun.es/us/nZ-wz?i=425454830' })
      .then((response) => {
        const page = response.data;
        const outcome = page.indexOf('Fantasy in D') >= 0 && page.indexOf('Turning Point') >= 0 && page.indexOf('Aaron Goldberg') >= 0;
        expect(outcome).to.be.true;
        done();
      })
      .catch(err => done(err));
    });

    it('should fetch missing links given a brand new apple link', (done) => {
      axios.post('http://localhost:8000/api/link', { link: 'https://itun.es/us/kQRMj?i=161135249' })
      .then((response) => {
        const page = response.data;
        const outcome = page.indexOf('La danse des canards') >= 0 && page.indexOf('La danse des canards - Single') >= 0 && page.indexOf('JJ Lionel') >= 0;
        expect(outcome).to.be.true;
        return Link.where({ type: 'song', apple: 'https://itun.es/us/kQRMj?i=161135249' }).fetch();
      })
      .then((link) => {
        expect(link.spotify).to.equal('https://open.spotify.com/track/5CsO52MwxKrkgEMYBueBKB');
        // complete list with other services as they become supported.
        done();
      })
      .catch(err => done(err));
    });

    // should fetch missing links given a brand new link
      // output on page should be correct
      // database should be populated with the right stuff
    // should complete a missing link given a previously existing, but incomplete link ==> does this make much sense though? We'll always try to complete it.
    // should fail when xyz
  });
});
