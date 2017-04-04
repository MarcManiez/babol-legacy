module.exports = {
  development: {
    client: 'pg',
    connection: { user: process.env.PG_USER, database: 'babol' },
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
  },
};
