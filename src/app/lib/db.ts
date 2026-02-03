import { Pool } from 'pg'

declare global {
  var pgPool: Pool | undefined
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

const pool: Pool = global.pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL })
global.pgPool = pool

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// pool.on('connect', (client) => {
//   ; 
// });

export default pool
