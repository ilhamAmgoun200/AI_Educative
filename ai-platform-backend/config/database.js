const path = require('path');

module.exports = ({ env }) => {
  return {
    connection: {
      client: 'postgres',
      connection: {
        host: env('DATABASE_HOST'),               // Neon host
        port: env.int('DATABASE_PORT', 5432),    // Neon port
        database: env('DATABASE_NAME'),          // Neon database name
        user: env('DATABASE_USERNAME'),          // Neon username
        password: env('DATABASE_PASSWORD'),      // Neon password
        ssl: env.bool('DATABASE_SSL', true) && { rejectUnauthorized: false }, // obligatoire pour Neon
        schema: env('DATABASE_SCHEMA', 'public'), 
      },
      pool: { min: 2, max: 10 },
      acquireConnectionTimeout: 60000,
    },
  };
};

