// const axios = require('axios');

// // axios.get('https://itun.es/us/1sl')
// axios.get('https://itun.es/us/DSm?i=51938')
// .then((response) => {
//   debugger;
//   console.log(typeof response);
//   // for (const prop in response) {
//   //   if (prop !== 'data') {
//   //     console.log(prop, response[prop]);
//   //   }
//   // }
//   console.log('itunes response:', response);
// })
// .catch((err) => {
//   console.log('error fetching itunes link:', err);
// });

const express = require('express');
const path = require('path');
const morgan = require('morgan');

const routes = require('./routes');

const app = express();

const port = process.env.PORT || 8000;

app.listen(port);

app.use(morgan('dev'));
app.use('/api', routes);

app.use(express.static(path.join(__dirname, '../client')));
