import { Worker, Job } from 'bullmq';
import { QUEUE_NAMES, redisConnection } from './queues.js';
import { deliverNotification } from '../modules/notifications/notifications.service.js';
import { markFailed } from '../modules/notifications/notifications.repo.js';

interface NotificationJobData {
  notificationId: string;
}

export const createNotificationWorker = (): Worker => {
  const worker = new Worker<NotificationJobData>(
    QUEUE_NAMES.NOTIFICATIONS,
    async (job: Job<NotificationJobData>) => {
      return deliverNotification(job.data.notificationId);
    },
    { connection: redisConnection as any }
  );

  worker.on('completed', (job: Job) => {
    console.log(`[NotificationWorker] Job ${job.id} completed`);
  });

  worker.on('failed', async (job: Job<NotificationJobData> | undefined, err: Error) => {
    console.error(`[NotificationWorker] Job ${job?.id} failed:`, err);
    if (job?.data.notificationId && job.attemptsMade >= (job.opts.attempts || 1)) {
      await markFailed(job.data.notificationId);
    }
  });

  return worker;
};
