module.exports = {
  development: {
    client: 'pg',
    connection: { user: process.env.PG_USER, database: 'babol' },
  },
  test: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
  },
};
