const express = require('express');
const path = require('path');
const morgan = require('morgan');
const swig = require('swig');
const bodyParser = require('body-parser');

const db = require('../connection');
const routes = require('./routes');

const app = express();
module.exports = app;

app.engine('html', swig.renderFile);
app.set('view engine', 'html');

// TODO: separate middleware into new file
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/frontend-js', express.static(path.join(__dirname, '../frontend-js')));
app.get('/', (req, res) => res.render('index'));
app.use('/api', routes);
