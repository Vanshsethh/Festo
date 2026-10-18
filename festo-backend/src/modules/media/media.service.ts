import { cloudinary, isCloudinaryConfigured } from '../../config/cloudinary.js';
import { AppError } from '../../middleware/errorHandler.js';
import { hasCollegeAccess } from '../../middleware/authorize.js'; // This now does ownership check (user.id === resourceCreatorId)
import * as eventsRepo from '../events/events.repo.js';
import * as collegesRepo from '../colleges/colleges.repo.js';
import type { AuthUser, College, Event } from '../../types/index.js';

type MediaKind = 'event_poster' | 'college_logo' | 'college_cover';
type UploadMediaInput = { kind: MediaKind; data: string; event_id?: string };
type MediaEvent = Event & { poster_public_id?: string | null };
type MediaCollege = College & { logo_public_id?: string | null; cover_public_id?: string | null };

const folderFor = (kind: MediaKind) => ({ event_poster: 'festo/events', college_logo: 'festo/colleges/logos', college_cover: 'festo/colleges/covers' })[kind];

const removePrevious = async (publicId?: string | null) => {
  if (!publicId) return;
  try { await cloudinary.uploader.destroy(publicId, { resource_type: 'image' }); } catch (error) { console.error('Could not replace media asset:', error instanceof Error ? error.message : error); }
};

export const uploadMedia = async (user: AuthUser, { kind, data, event_id: eventId }: UploadMediaInput) => {
  if (!isCloudinaryConfigured) throw new AppError('Media uploads are not configured.', 503);

  let existingEvent: MediaEvent | null = null;
  let existingCollege: MediaCollege | null = null;
  if (kind === 'event_poster') {
    existingEvent = await eventsRepo.findById(eventId!) as MediaEvent | null;
    if (!existingEvent) throw new AppError('Event not found.', 404);
    // Check ownership: user must be the creator of the event
    if (!hasCollegeAccess(user, existingEvent.created_by)) throw new AppError('You are not authorized to update this event media.', 403);
    if (!['DRAFT', 'REJECTED'].includes(existingEvent.status)) throw new AppError('Event media can only be updated while the event is a draft or rejected.', 409);
  } else {
    existingCollege = await collegesRepo.findCollegeById(user.college_id!) as MediaCollege | null;
    if (!existingCollege) throw new AppError('You are not associated with a college.', 403);
    // Check ownership: user must be the creator of the college (applied_by)
    if (!hasCollegeAccess(user, existingCollege.applied_by)) throw new AppError('You are not authorized to update this college media.', 403);
  }

  const asset = await cloudinary.uploader.upload(data, { folder: folderFor(kind), resource_type: 'image', overwrite: false });
  if (kind === 'event_poster') {
    await eventsRepo.update(eventId!, { poster_url: asset.secure_url, poster_public_id: asset.public_id });
    await removePrevious(existingEvent!.poster_public_id);
  } else {
    const prefix = kind === 'college_logo' ? 'logo' : 'cover';
    await collegesRepo.update(existingCollege!.id, { [`${prefix}_url`]: asset.secure_url, [`${prefix}_public_id`]: asset.public_id });
    await removePrevious(existingCollege![`${prefix}_public_id`]);
  }
  return { url: asset.secure_url, public_id: asset.public_id };
};
