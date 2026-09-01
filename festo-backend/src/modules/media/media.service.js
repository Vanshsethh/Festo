import { cloudinary, isCloudinaryConfigured } from '../../config/cloudinary.js';
import { AppError } from '../../middleware/errorHandler.js';
import { hasCollegeAccess } from '../../middleware/authorize.js'; // This now does ownership check (user.id === resourceCreatorId)
import * as eventsRepo from '../events/events.repo.js';
import * as collegesRepo from '../colleges/colleges.repo.js';

const folderFor = (kind) => ({ event_poster: 'festo/events', college_logo: 'festo/colleges/logos', college_cover: 'festo/colleges/covers' })[kind];

const removePrevious = async (publicId) => {
  if (!publicId) return;
  try { await cloudinary.uploader.destroy(publicId, { resource_type: 'image' }); } catch (error) { console.error('Could not replace media asset:', error.message); }
};

export const uploadMedia = async (user, { kind, data, event_id: eventId }) => {
  if (!isCloudinaryConfigured) throw new AppError('Media uploads are not configured.', 503);

  let existing;
  if (kind === 'event_poster') {
    existing = await eventsRepo.findById(eventId);
    if (!existing) throw new AppError('Event not found.', 404);
    // Check ownership: user must be the creator of the event
    if (!hasCollegeAccess(user, existing.created_by)) throw new AppError('You are not authorized to update this event media.', 403);
    if (!['DRAFT', 'REJECTED'].includes(existing.status)) throw new AppError('Event media can only be updated while the event is a draft or rejected.', 409);
  } else {
    existing = await collegesRepo.findCollegeById(user.college_id);
    if (!existing) throw new AppError('You are not associated with a college.', 403);
    // Check ownership: user must be the creator of the college (applied_by)
    if (!hasCollegeAccess(user, existing.applied_by)) throw new AppError('You are not authorized to update this college media.', 403);
  }

  const asset = await cloudinary.uploader.upload(data, { folder: folderFor(kind), resource_type: 'image', overwrite: false });
  if (kind === 'event_poster') {
    await eventsRepo.update(eventId, { poster_url: asset.secure_url, poster_public_id: asset.public_id });
    await removePrevious(existing.poster_public_id);
  } else {
    const prefix = kind === 'college_logo' ? 'logo' : 'cover';
    await collegesRepo.update(existing.id, { [`${prefix}_url`]: asset.secure_url, [`${prefix}_public_id`]: asset.public_id });
    await removePrevious(existing[`${prefix}_public_id`]);
  }
  return { url: asset.secure_url, public_id: asset.public_id };
};