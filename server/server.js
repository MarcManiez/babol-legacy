const express = require('express');
const path = require('path');
const morgan = require('morgan');
const swig = require('swig');
const bodyParser = require('body-parser');

const db = require('../connection');
const routes = require('./routes');
const getLink = require('./controllers/linksController').get;

const app = express();
module.exports = app;

app.engine('html', swig.renderFile);
app.set('view engine', 'html');

// TODO: separate middleware into new file
app.use(morgan('dev'));
app.use(bodyParser.json());
if (process.env.ENV !== 'production') {
  swig.setDefaults({ cache: false });
}
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/client', express.static(path.join(__dirname, '../client')));
app.get('/', (req, res) => res.render('index'));
app.get('/:id', getLink);
app.use('/api', routes);
