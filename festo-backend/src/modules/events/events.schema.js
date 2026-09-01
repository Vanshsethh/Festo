import { z } from 'zod';

export const EVENT_CATEGORIES = [
  'FEST', 'CULTURAL', 'DANCE', 'MUSIC', 'TECHNICAL', 'SPORTS', 'HACKATHON',
  'WORKSHOP', 'CONCERT', 'COMPETITION', 'QUIZ', 'MUN', 'GAMING', 'LITERARY',
  'DRAMA_THEATRE', 'ART_DESIGN', 'OTHER',
];

const optionalUrl = z.string().url('Poster URL must be valid.').nullable().optional().or(z.literal(''));

const eventFields = {
  college_id: z.string().uuid('Please choose a college.'),
  title: z.string().trim().min(3, 'Title must be at least 3 characters.').max(200),
  description: z.string().trim().max(10000).nullable().optional(),
  category: z.enum(EVENT_CATEGORIES),
  poster_url: optionalUrl,
  poster_public_id: z.string().max(500).nullable().optional(),
  venue: z.string().trim().max(200).nullable().optional(),
  address: z.string().trim().max(1000).nullable().optional(),
  start_date: z.string().datetime({ offset: true }),
  end_date: z.string().datetime({ offset: true }),
  registration_deadline: z.string().datetime({ offset: true }),
  capacity: z.coerce.number().int().positive().nullable().optional(),
};

const datesAreValid = (data, ctx) => {
  const start = new Date(data.start_date);
  const end = new Date(data.end_date);
  const deadline = new Date(data.registration_deadline);
  if (end <= start) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['end_date'], message: 'End date must be after start date.' });
  if (deadline >= start) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['registration_deadline'], message: 'Registration deadline must be before the event starts.' });
};

export const createEventSchema = z.object(eventFields).superRefine(datesAreValid);

export const updateEventSchema = z.object({
  college_id: eventFields.college_id.optional(),
  title: eventFields.title.optional(),
  description: eventFields.description,
  category: eventFields.category.optional(),
  poster_url: optionalUrl,
  poster_public_id: z.string().max(500).nullable().optional(),
  venue: eventFields.venue,
  address: eventFields.address,
  start_date: eventFields.start_date.optional(),
  end_date: eventFields.end_date.optional(),
  registration_deadline: eventFields.registration_deadline.optional(),
  capacity: eventFields.capacity,
}).strict();

export const eventsQuerySchema = z.object({
  search: z.string().trim().max(200).optional(),
  category: z.enum(EVENT_CATEGORIES).optional(),
  college_id: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
