const routes = require('express').Router();

routes.post('/link', (req, res, next) => {
  res.redirect('/links.html');
});

module.exports = routes;