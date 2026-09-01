import { z } from 'zod';

export const applyCollegeSchema = z.object({
  name: z
    .string({ required_error: 'College name is required' })
    .trim()
    .min(2, 'College name must be at least 2 characters')
    .max(200, 'College name must not exceed 200 characters'),
  description: z.string().trim().max(2000, 'Description too long').optional().nullable(),
  location: z.string().trim().max(200, 'Location too long').optional().nullable(),
  logo_url: z.string().url('Invalid logo URL').optional().nullable().or(z.literal('')),
  logo_public_id: z.string().optional().nullable(),
  cover_url: z.string().url('Invalid cover URL').optional().nullable().or(z.literal('')),
  cover_public_id: z.string().optional().nullable(),
});

export const updateCollegeSchema = z.object({
  name: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  location: z.string().trim().max(200).optional().nullable(),
  logo_url: z.string().url().optional().nullable().or(z.literal('')),
  logo_public_id: z.string().optional().nullable(),
  cover_url: z.string().url().optional().nullable().or(z.literal('')),
  cover_public_id: z.string().optional().nullable(),
});

export const collegeQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
