const expect = require('chai').expect;

const detectService = require('../server/controllers/linksController').detectService;

describe('Links controler', () => {
  const error = new Error('Invalid link or unsupported service.');

  it('should return an error if no link is provided', (done) => {
    detectService().then()
    .catch((err) => { expect(err).to.eql(error); done(); });
  });

  it('should correctly detect valid apple links', (done) => {
    detectService('https://itun.es/us/8FRu')
    .then((service) => { expect(service).to.equal('apple'); done(); });
  });

  it('should correctly detect valid spotify links', (done) => {
    detectService('https://play.spotify.com/artist/0BTfBwYC5Mw5ezDg91JBma')
    .then((service) => { expect(service).to.equal('spotify'); done(); });
  });

  it('should correctly detect invalid links', (done) => {
    detectService('https://iun.e/us/8FRu').then()
    .catch((err) => { expect(err).to.eql(error); done(); });
  });
});
