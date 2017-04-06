const path = require('path');
const morgan = require('morgan');
const cookie = require('cookie');
const express = require('express');
const bodyParser = require('body-parser');

const getLink = require('./controllers/linksController').get;

module.exports = (app) => {
  // app.use((req, res, next) => {
  //   const sweetCookie = req.get('Cookie');
  //   if (sweetCookie) {
  //     console.log('yaya?');
  //     console.log(sweetCookie);
  //   }
  //   next();
  // });
  app.use(morgan('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
};
