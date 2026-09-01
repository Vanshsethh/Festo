import { z } from 'zod';

export const scanPassSchema = z.object({
  qr_token: z.string().trim().min(20, 'A valid QR token is required.').max(500),
}).strict();
