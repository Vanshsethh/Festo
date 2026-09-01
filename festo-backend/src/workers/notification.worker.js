import { Worker } from 'bullmq';
import { QUEUE_NAMES, redisConnection } from './queues.js';
import { deliverNotification, } from '../modules/notifications/notifications.service.js';
import { markFailed } from '../modules/notifications/notifications.repo.js';

export const createNotificationWorker = () => {
  const worker = new Worker(
    QUEUE_NAMES.NOTIFICATIONS,
    async (job) => {
      return deliverNotification(job.data.notificationId);
    },
    { connection: redisConnection }
  );

  worker.on('completed', (job) => {
    console.log(`[NotificationWorker] Job ${job.id} completed`);
  });

  worker.on('failed', async (job, err) => {
    console.error(`[NotificationWorker] Job ${job?.id} failed:`, err);
    if (job?.data.notificationId && job.attemptsMade >= (job.opts.attempts || 1)) await markFailed(job.data.notificationId);
  });

  return worker;
};
