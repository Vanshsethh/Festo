import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { Redis } from 'ioredis';
import { env } from '../config/env.js';

let redisClient: Redis | null = null;
type RedisReply = boolean | number | string | Array<boolean | number | string>;

try {
  redisClient = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    enableReadyCheck: false,
    lazyConnect: true,
    retryStrategy: () => null, // don't spam retries if offline
  });

  redisClient.on('error', () => {
    // dev quiet fallback
  });

  redisClient.connect().catch(() => {});
} catch (_e) {
  redisClient = null;
}

const createStore = (prefix: string) => {
  if (redisClient) {
    try {
      return new RedisStore({
        sendCommand: (...args: string[]): Promise<RedisReply> =>
          redisClient.call(args[0], ...args.slice(1)) as Promise<RedisReply>,
        prefix: `rl:${prefix}:`,
      });
    } catch {
      return undefined;
    }
  }
  return undefined;
};

export const standardRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('standard'),
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('auth'),
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});
