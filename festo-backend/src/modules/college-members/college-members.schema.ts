import { z } from 'zod';

export const addMemberSchema = z.object({
  email: z
    .string({ required_error: 'Member email is required' })
    .trim()
    .toLowerCase()
    .email('Invalid email address'),
  role: z.enum(['ORGANIZER']).default('ORGANIZER'),
});

export type AddMemberInput = z.infer<typeof addMemberSchema>;
