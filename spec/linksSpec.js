const expect = require('chai').expect;

const detectService = require('../server/controllers/linksController').detectService;

describe('Links', () => {
  const error = new Error('Invalid link or unsupported service.');

  it('should return an error if no link is provided', () => {
    expect(detectService()).to.eql(error);
  });

  it('should correctly detect valid apple links', () => {
    expect(detectService('https://itun.es/us/8FRu')).to.equal('apple');
  });

  it('should correctly detect valid spotify links', () => {
    expect(detectService('https://play.spotify.com/artist/0BTfBwYC5Mw5ezDg91JBma')).to.equal('spotify');
  });

  it('should correctly detect invalid links', () => {
    expect(detectService('https://iun.e/us/8FRu')).to.eql(error);
  });
});
