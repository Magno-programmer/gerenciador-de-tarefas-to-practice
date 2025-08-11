const { Pool } = require('pg');
const { dbUrl } = require('./config');
const pool = new Pool({ connectionString: dbUrl });
module.exports = pool;