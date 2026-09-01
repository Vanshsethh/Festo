import { Worker } from 'bullmq';
import { QUEUE_NAMES, redisConnection } from './queues.js';
import { generateTicketsForRegistration } from '../modules/passes/passes.service.js';

export const createTicketWorker = () => {
  const worker = new Worker(
    QUEUE_NAMES.PASS_GENERATION,
    async (job) => {
      console.log(`[TicketWorker] Processing job ${job.id} for registration ${job.data.registrationId} with quantity ${job.data.quantity}`);
      return generateTicketsForRegistration(job.data.registrationId, job.data.quantity);
    },
    { connection: redisConnection }
  );

  worker.on('completed', (job) => {
    console.log(`[TicketWorker] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[TicketWorker] Job ${job?.id} failed:`, err);
  });

  return worker;
};