const routes = require('express').Router();

const links = require('./controllers/linksController');

routes.post('/link', links.post);

module.exports = routes;
