const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in environment");
}

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  ssl: { rejectUnauthorized: false },
});

pgPool.on("error", (err) => {
  console.error("[postgres] Unexpected error on idle client", err);
});

const pgQuery = (text, params) => pgPool.query(text, params);

module.exports = { pgPool, pgQuery };