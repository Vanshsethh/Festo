import { Worker, Job } from 'bullmq';
import { QUEUE_NAMES, redisConnection } from './queues.js';
import { generateTicketsForRegistration } from '../modules/passes/passes.service.js';

interface TicketJobData {
  registrationId: string;
  quantity: number;
}

export const createTicketWorker = (): Worker => {
  const worker = new Worker<TicketJobData>(
    QUEUE_NAMES.PASS_GENERATION,
    async (job: Job<TicketJobData>) => {
      console.log(
        `[TicketWorker] Processing job ${job.id} for registration ${job.data.registrationId} with quantity ${job.data.quantity}`
      );
      return generateTicketsForRegistration(job.data.registrationId, job.data.quantity);
    },
    { connection: redisConnection as any }
  );

  worker.on('completed', (job: Job) => {
    console.log(`[TicketWorker] Job ${job.id} completed`);
  });

  worker.on('failed', (job: Job | undefined, err: Error) => {
    console.error(`[TicketWorker] Job ${job?.id} failed:`, err);
  });

  return worker;
};
