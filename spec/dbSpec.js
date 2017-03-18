const expect = require('chai').expect;

const Link = require('../database/models/link');
const searchLink = require('../server/controllers/linksController').searchLink;

xdescribe('Database Controller', () => {
  describe('searchLink', () => {
    const error = new Error('Please provide a link and a service');

    it('should return an error if one or fewer arguments are provided', (done) => {
      searchLink().then().catch((err) => { expect(err).to.eql(error); done(); });
    });

    it('should correctly detect if a link is inside the database', (done) => {
      searchLink('https://itun.es/us/nZ-wz?i=425454830', 'apple')
      .then((link) => {
        expect(link.spotify).to.equal('https://open.spotify.com/track/2OWKDnQje6CyuUHtOWVuD9');
        expect(link.apple).to.equal('https://itun.es/us/nZ-wz?i=425454830');
        expect(link.artist.name).to.equal('Aaron Goldberg');
        expect(link.album.name).to.equal('Turning Point');
        expect(link.song.name).to.equal('Fantasy in D');
        done();
      })
      .catch(err => done(err));
    });

    it('should correctly detect if a link is being requested from the wrong service', (done) => {
      searchLink('https://open.spotify.com/track/2OWKDnQje6CyuUHtOWVuD9', 'apple')
      .then((link) => { expect(link).to.be.falsy; done(); })
      .catch(err => done(err));
    });

    it('should correctly detect if a link is not inside the database', (done) => {
      searchLink('https://itun.es/us/kD24B', 'apple')
      .then((link) => { expect(link).to.be.falsy; done(); })
      .catch(err => done(err));
    });
  });
});
