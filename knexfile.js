module.exports = {
  development: {
    client: 'pg',
    connection: { user: process.env.PG_USER, database: 'babol' },
  },
};
