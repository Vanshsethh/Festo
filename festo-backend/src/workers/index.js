import { createTicketWorker } from './pass.worker.js';
import { createNotificationWorker } from './notification.worker.js';
import { createReminderWorker } from './reminder.worker.js';
import { pool } from '../db/pool.js';
import { redisConnection } from './queues.js';
import { recoverOutstandingTickets } from '../modules/passes/passes.service.js';

const startWorkers = async () => {
  try {
    // Verify DB & Redis connection
    await pool.query('SELECT 1');
    console.log('✅ PostgreSQL connection verified for workers');

    const ticketWorker = createTicketWorker();
    const notificationWorker = createNotificationWorker();
    const reminderWorker = createReminderWorker();
    const recoveredTickets = await recoverOutstandingTickets();

    console.log('⚙️  Festo BullMQ workers initialized and listening for jobs...');
    if (recoveredTickets) console.log(`↻ Re-enqueued ${recoveredTickets} outstanding ticket generation job(s)`);

    const shutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Gracefully stopping BullMQ workers...`);
      await Promise.all([
        ticketWorker.close(),
        notificationWorker.close(),
        reminderWorker.close(),
      ]);
      await redisConnection.quit();
      await pool.end();
      console.log('🛑 Workers, Redis, and PostgreSQL connections closed.');
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start BullMQ workers:', error);
    process.exit(1);
  }
};

startWorkers();