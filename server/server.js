const express = require('express');
const swig = require('swig');

const db = require('../connection').bookshelf;
const middleware = require('./middleware');

const routes = require('./routes');

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

// routes
routes(app);
