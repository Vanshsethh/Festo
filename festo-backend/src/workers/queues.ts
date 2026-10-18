import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { env } from '../config/env.js';

export const redisConnection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
  retryStrategy: (times: number) => {
    if (times > 5) return null;
    return Math.min(times * 500, 3000);
  },
});

redisConnection.on('error', (err: Error) => {
  // Suppress uncaught redis connection exceptions in local development when offline
  if (env.NODE_ENV !== 'production') {
    // handled gracefully
  } else {
    console.error('Redis connection error:', err);
  }
});

export const QUEUE_NAMES = {
  PASS_GENERATION: 'pass-generation',
  NOTIFICATIONS: 'notifications',
  EVENT_REMINDERS: 'event-reminders',
} as const;

export const passGenerationQueue = new Queue(QUEUE_NAMES.PASS_GENERATION, {
  connection: redisConnection as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

export const notificationsQueue = new Queue(QUEUE_NAMES.NOTIFICATIONS, {
  connection: redisConnection as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

export const eventRemindersQueue = new Queue(QUEUE_NAMES.EVENT_REMINDERS, {
  connection: redisConnection as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

export const enqueueTicketGeneration = async (
  registrationId: string,
  quantity: number
): Promise<unknown> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Ticket queue is unavailable.')), 1500);
  });

  try {
    return await Promise.race([
      passGenerationQueue.add('generate-tickets', { registrationId, quantity }),
      timeout,
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

export const enqueueNotification = async (notificationId: string): Promise<unknown> =>
  notificationsQueue.add('deliver-notification', { notificationId });

export const enqueueEventReminder = async (
  eventId: string,
  startDate: string | Date
): Promise<unknown> => {
  const delay = Math.max(0, new Date(startDate).getTime() - Date.now() - 24 * 60 * 60 * 1000);
  return eventRemindersQueue.add('event-reminder', { eventId }, { delay });
};
