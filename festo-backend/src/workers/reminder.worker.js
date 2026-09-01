import { Worker } from 'bullmq';
import { QUEUE_NAMES, redisConnection } from './queues.js';
import { createEventReminders } from '../modules/notifications/notifications.service.js';

export const createReminderWorker = () => {
  const worker = new Worker(
    QUEUE_NAMES.EVENT_REMINDERS,
    async (job) => {
      return { status: 'processed', notifications: await createEventReminders(job.data.eventId) };
    },
    { connection: redisConnection }
  );

  worker.on('completed', (job) => {
    console.log(`[ReminderWorker] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[ReminderWorker] Job ${job?.id} failed:`, err);
  });

  return worker;
};
