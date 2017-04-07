const cookie = require('cookie');

module.exports = {
  // one method to set the cookie to a new value
  setService: (req, res) => {
    const { service } = req.body;
    res.setHeader('Set-Cookie', cookie.serialize('service', service));
    res.status(201).json({ service });
  },
  // one method to provide the user with the current cookie value
  getService: (req, res) => {

  },
  // some middleware to reapply the cookie continuously under the right conditions
  // some middleware to redurect when a user hits /links/:id with a cookie
};
