const expect = require('chai').expect;

const db = require('../connection');
const Link = require('../database/models/link');

const searchLink = require('../server/controllers/linksController').searchLink;

describe('Database Controller', () => {
  describe('searchLink', () => {
    const error = new Error('Please provide a link and a service');

    it('should return an error if one or fewer arguments are provided', () => {
      searchLink().then().catch((err) => { expect(err).to.eql(error); });
    });

    it('should correctly detect if a link is inside the database', () => {
      searchLink('https://itun.es/us/nZ-wz?i=425454830', 'apple')
      .then((link) => { expect(link).to.equal(true); })
      .catch((err) => { expect(err).to.equal(true); });
    });

    it('should correctly detect if a link is being requested from the wrong service', () => {
      searchLink('https://open.spotify.com/track/2OWKDnQje6CyuUHtOWVuD9', 'apple')
      .then()
      .catch((err) => { expect(err).to.equal(null); });
    });

    it('should correctly detect if a link is not inside the database', () => {
      searchLink('https://itun.es/us/kD24B', 'apple')
      .then()
      .catch((err) => { expect(err).to.equal(null); });
    });
  });
});
