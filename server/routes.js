const express = require('express');
const path = require('path');

const links = require('./controllers/linksController');
const getLink = require('./controllers/linksController').get;
const service = require('./controllers/servicesController/service');

const apiRoutes = express.Router();
apiRoutes.post('/link', links.post);
apiRoutes.post('/service', service.setService);

module.exports = (app) => {
  app.use('*/client', express.static(path.join(__dirname, '../client')));
  app.get('/', (req, res) => res.render('index', { url: req.url }));
  app.get('/link/:id', getLink);
  app.use('/api', apiRoutes);
};
