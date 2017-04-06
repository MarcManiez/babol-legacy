const express = require('express');
const path = require('path');
// const morgan = require('morgan');
// const bodyParser = require('body-parser');
const swig = require('swig');

const db = require('../connection');
const middleware = require('./middleware');

const routes = require('./routes');
const getLink = require('./controllers/linksController').get;

const app = express();
module.exports = app;

// templating configuration
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
if (process.env.ENV !== 'production') {
  swig.setDefaults({ cache: false });
}

// middleware invocation
middleware(app);

// TODO: separate middleware into new file
app.use('*/client', express.static(path.join(__dirname, '../client')));
app.get('/', (req, res) => res.render('index', { url: req.url }));
app.get('/link/:id', getLink);
app.use('/api', routes);
