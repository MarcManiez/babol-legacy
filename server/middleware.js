const path = require('path');
const morgan = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');

const getLink = require('./controllers/linksController').get;

module.exports = (app) => {
  app.use(morgan('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
};
