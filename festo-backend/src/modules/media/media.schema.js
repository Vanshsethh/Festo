import { z } from 'zod';

export const uploadMediaSchema = z.object({
  kind: z.enum(['event_poster', 'college_logo', 'college_cover']),
  data: z.string().regex(/^data:image\/(png|jpe?g|webp);base64,/, 'Upload a PNG, JPEG, or WebP image.'),
  event_id: z.string().uuid().optional(),
}).superRefine((value, ctx) => {
  if (value.kind === 'event_poster' && !value.event_id) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['event_id'], message: 'An event is required for a poster upload.' });
});
