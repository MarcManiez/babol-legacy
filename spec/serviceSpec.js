const expect = require('chai').expect;
const services = require('../server/controllers/servicesController');

describe('Services Controller', () => {
  describe('Apple', () => {
    describe('getUrl', () => {
      it('should return the long form version of a shared url given a valid link', (done) => {
        services.apple.getUrl('https://itun.es/us/ISGKF?i=529664804')
        .then((url) => { expect(url).to.equal('https://itunes.apple.com/us/album/its-you-i-like/id529664802?i=529664804'); done(); });
      });
    });

    describe('getType', () => {
      it('should return return the link type \'song\' given a valid song link', (done) => {
        services.apple.getType('https://itunes.apple.com/us/album/its-you-i-like/id529664802?i=529664804')
        .then((type) => { expect(type).to.equal('song'); done(); });
      });

      it('should return return the link type \'album\' given a valid song link', (done) => {
        services.apple.getType('https://itunes.apple.com/us/album/turning-point/id425454797')
        .then((type) => { expect(type).to.equal('album'); done(); });
      });

      it('should return return the link type \'artist\' given a valid song link', (done) => {
        services.apple.getType('https://itunes.apple.com/us/artist/aaron-goldberg/id5421052')
        .then((type) => { expect(type).to.equal('artist'); done(); });
      });

      it('should throw an error if a link type cannot be derived', (done) => {
        services.apple.getType('https://itunes.apple.com/us/atist/aaron-goldberg/id5421052')
        .then()
        .catch((err) => { expect(err).to.be.equal('Could not derive type based on provided url.'); done(); });
      });
    });
  });
});
