const axios = require('axios');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const linksController = require('../server/controllers/linksController');
const Link = require('../database/models/link');
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
    // given a type and a name, it should try to find a matching record (with related entities), or return null if it can't
    // example of a song that should never be in the DB, https://itun.es/us/kD24B?i=467888110 search and delete in the before hook
    // 
  });

  describe('post', () => {
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
    // should complete a missing link given a previously existing, but incomplete link
    // should fail when xyz
  });
});
