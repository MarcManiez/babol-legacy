const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const services = require('../../server/controllers/servicesController/servicesController');
const apple = require('./appleSpec.js');
const spotify = require('./spotifySpec.js');

const mockData = require('../mockData');

const expect = chai.expect;
chai.use(chaiAsPromised);

// TODO: refactor with chaiAsPromised

describe('Services Controller', () => {
  resetDb();
  describe('Apple', apple);

  resetDb();
  describe('Spotify', spotify);
});
