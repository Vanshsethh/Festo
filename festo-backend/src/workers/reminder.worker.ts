import { Worker, Job } from 'bullmq';
import { QUEUE_NAMES, redisConnection } from './queues.js';
import { createEventReminders } from '../modules/notifications/notifications.service.js';

interface ReminderJobData {
  eventId: string;
}

export const createReminderWorker = (): Worker => {
  const worker = new Worker<ReminderJobData>(
    QUEUE_NAMES.EVENT_REMINDERS,
    async (job: Job<ReminderJobData>) => {
      return {
        status: 'processed',
        notifications: await createEventReminders(job.data.eventId),
      };
    },
    { connection: redisConnection as any }
  );

  worker.on('completed', (job: Job) => {
    console.log(`[ReminderWorker] Job ${job.id} completed`);
  });

  worker.on('failed', (job: Job | undefined, err: Error) => {
    console.error(`[ReminderWorker] Job ${job?.id} failed:`, err);
  });

  return worker;
};
