/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  // Update user_role enum to use USER and ORGANIZER instead of old roles
  pgm.sql('ALTER TYPE user_role RENAME TO user_role_old');
  pgm.createType('user_role', ['USER', 'ORGANIZER']);

  // Handle the role column default before changing type
  pgm.sql('ALTER TABLE users ALTER COLUMN role DROP DEFAULT');
  pgm.sql('ALTER TABLE users ALTER COLUMN role TYPE user_role USING ' +
    'CASE role ' +
    'WHEN \'STUDENT\' THEN \'USER\' ' +
    'WHEN \'COLLEGE_ADMIN\' THEN \'ORGANIZER\' ' +
    'WHEN \'COLLEGE_STAFF\' THEN \'ORGANIZER\' ' +
    'WHEN \'SUPER_ADMIN\' THEN \'ORGANIZER\' ' +
    'END::user_role');
  pgm.sql('ALTER TABLE users ALTER COLUMN role SET DEFAULT \'USER\'');
  pgm.sql('DROP TYPE user_role_old');

  // Update college_verification_status to simplify - all colleges are verified by default for MVP
  pgm.sql('ALTER TYPE college_verification_status RENAME TO college_verification_status_old');
  pgm.createType('college_verification_status', ['VERIFIED']); // All colleges are verified by default
  pgm.sql('ALTER TABLE colleges ALTER COLUMN verification_status DROP DEFAULT');
  pgm.sql('ALTER TABLE colleges ALTER COLUMN verification_status TYPE college_verification_status USING ' +
    'CASE verification_status ' +
    'WHEN \'PENDING\' THEN \'VERIFIED\' ' +
    'WHEN \'VERIFIED\' THEN \'VERIFIED\' ' +
    'WHEN \'REJECTED\' THEN \'VERIFIED\' ' +
    'END::college_verification_status');
  pgm.sql('ALTER TABLE colleges ALTER COLUMN verification_status SET DEFAULT \'VERIFIED\'');
  pgm.sql('DROP TYPE college_verification_status_old');

  // Update event_status to simplify - all events are published by default for MVP
  pgm.sql('ALTER TYPE event_status RENAME TO event_status_old');
  pgm.createType('event_status', ['PUBLISHED']); // All events are published by default for MVP
  pgm.sql('ALTER TABLE events ALTER COLUMN status DROP DEFAULT');
  pgm.sql('ALTER TABLE events ALTER COLUMN status TYPE event_status USING ' +
    'CASE status ' +
    'WHEN \'DRAFT\' THEN \'PUBLISHED\' ' +
    'WHEN \'PENDING_APPROVAL\' THEN \'PUBLISHED\' ' +
    'WHEN \'PUBLISHED\' THEN \'PUBLISHED\' ' +
    'WHEN \'REGISTRATION_OPEN\' THEN \'PUBLISHED\' ' +
    'WHEN \'REGISTRATION_CLOSED\' THEN \'PUBLISHED\' ' +
    'WHEN \'ONGOING\' THEN \'PUBLISHED\' ' +
    'WHEN \'COMPLETED\' THEN \'PUBLISHED\' ' +
    'WHEN \'CANCELLED\' THEN \'PUBLISHED\' ' +
    'WHEN \'REJECTED\' THEN \'PUBLISHED\' ' +
    'END::event_status');
  pgm.sql('ALTER TABLE events ALTER COLUMN status SET DEFAULT \'PUBLISHED\'');
  pgm.sql('DROP TYPE event_status_old');

  // Update registration_status - keep as is for now (CONFIRMED, CANCELLED, ATTENDED)
  // Update notification_status - keep as is for now (PENDING, SENT, FAILED)
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  // Revert user_role enum to old roles
  pgm.sql('ALTER TYPE user_role RENAME TO user_role_new');
  pgm.createType('user_role', ['STUDENT', 'COLLEGE_ADMIN', 'COLLEGE_STAFF', 'SUPER_ADMIN']);

  // Handle the role column default before changing type
  pgm.sql('ALTER TABLE users ALTER COLUMN role DROP DEFAULT');
  pgm.sql('ALTER TABLE users ALTER COLUMN role TYPE user_role USING ' +
    'CASE role ' +
    'WHEN \'USER\' THEN \'STUDENT\' ' +
    'WHEN \'ORGANIZER\' THEN \'COLLEGE_ADMIN\' ' + // Map to COLLEGE_ADMIN as default
    'END::user_role');
  pgm.sql('ALTER TABLE users ALTER COLUMN role SET DEFAULT \'STUDENT\'');
  pgm.sql('DROP TYPE user_role_new');

  // Revert college_verification_status
  pgm.sql('ALTER TYPE college_verification_status RENAME TO college_verification_status_new');
  pgm.createType('college_verification_status', ['PENDING', 'VERIFIED', 'REJECTED']);
  pgm.sql('ALTER TABLE colleges ALTER COLUMN verification_status DROP DEFAULT');
  pgm.sql('ALTER TABLE colleges ALTER COLUMN verification_status TYPE college_verification_status USING verification_status::college_verification_status');
  pgm.sql('ALTER TABLE colleges ALTER COLUMN verification_status SET DEFAULT \'PENDING\'');
  pgm.sql('DROP TYPE college_verification_status_new');

  // Revert event_status
  pgm.sql('ALTER TYPE event_status RENAME TO event_status_new');
  pgm.createType('event_status', [
    'DRAFT',
    'PENDING_APPROVAL',
    'PUBLISHED',
    'REGISTRATION_OPEN',
    'REGISTRATION_CLOSED',
    'ONGOING',
    'COMPLETED',
    'CANCELLED',
    'REJECTED',
  ]);
  pgm.sql('ALTER TABLE events ALTER COLUMN status DROP DEFAULT');
  pgm.sql('ALTER TABLE events ALTER COLUMN status TYPE event_status USING status::event_status');
  pgm.sql('ALTER TABLE events ALTER COLUMN status SET DEFAULT \'DRAFT\'');
  pgm.sql('DROP TYPE event_status_new');
};