import { app } from './app.js';
import { env } from './config/env.js';
import { pool } from './db/pool.js';

const startServer = async () => {
  try {
    // Verify database connection
    await pool.query('SELECT 1');
    console.log('✅ PostgreSQL connected successfully');

    const server = app.listen(env.PORT, () => {
      console.log(`🚀 Festo API server running at http://localhost:${env.PORT}`);
      console.log(`📡 Environment: ${env.NODE_ENV}`);
    });

    const shutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Closing HTTP server and DB connections...`);
      server.close(async () => {
        await pool.end();
        console.log('🛑 PostgreSQL pool closed. Process terminated.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
