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
  // Enable pgcrypto extension for gen_random_uuid()
  pgm.sql('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');

  // Enums
  pgm.createType('user_role', ['STUDENT', 'COLLEGE_ADMIN', 'COLLEGE_STAFF', 'SUPER_ADMIN']);
  pgm.createType('user_status', ['ACTIVE', 'SUSPENDED']);
  pgm.createType('college_verification_status', ['PENDING', 'VERIFIED', 'REJECTED']);
  pgm.createType('college_member_role', ['COLLEGE_ADMIN', 'COLLEGE_STAFF']);
  pgm.createType('event_category', [
    'FEST',
    'CULTURAL',
    'DANCE',
    'MUSIC',
    'TECHNICAL',
    'SPORTS',
    'HACKATHON',
    'WORKSHOP',
    'CONCERT',
    'COMPETITION',
    'QUIZ',
    'MUN',
    'GAMING',
    'LITERARY',
    'DRAMA_THEATRE',
    'ART_DESIGN',
    'OTHER',
  ]);
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
  pgm.createType('registration_status', ['CONFIRMED', 'CANCELLED', 'ATTENDED']);
  pgm.createType('notification_status', ['PENDING', 'SENT', 'FAILED']);

  // Users Table
  pgm.createTable('users', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    email: { type: 'text', notNull: true, unique: true },
    password_hash: { type: 'text', notNull: true },
    name: { type: 'text', notNull: true },
    role: { type: 'user_role', notNull: true, default: 'STUDENT' },
    college_id: { type: 'uuid', null: true },
    status: { type: 'user_status', notNull: true, default: 'ACTIVE' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // Colleges Table
  pgm.createTable('colleges', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    name: { type: 'text', notNull: true },
    slug: { type: 'text', notNull: true, unique: true },
    description: { type: 'text' },
    logo_url: { type: 'text' },
    logo_public_id: { type: 'text' },
    cover_url: { type: 'text' },
    cover_public_id: { type: 'text' },
    location: { type: 'text' },
    verification_status: { type: 'college_verification_status', notNull: true, default: 'PENDING' },
    applied_by: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
      onDelete: 'RESTRICT',
    },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // Foreign key for users.college_id -> colleges(id)
  pgm.addConstraint('users', 'fk_users_college_id', {
    foreignKeys: {
      columns: 'college_id',
      references: 'colleges(id)',
      onDelete: 'SET NULL',
    },
  });

  // College Members Table
  pgm.createTable('college_members', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    college_id: {
      type: 'uuid',
      notNull: true,
      references: 'colleges(id)',
      onDelete: 'CASCADE',
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    role: { type: 'college_member_role', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.addConstraint('college_members', 'unique_college_user', {
    unique: ['college_id', 'user_id'],
  });

  // Events Table
  pgm.createTable('events', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    college_id: {
      type: 'uuid',
      notNull: true,
      references: 'colleges(id)',
      onDelete: 'CASCADE',
    },
    title: { type: 'text', notNull: true },
    slug: { type: 'text', notNull: true, unique: true },
    description: { type: 'text' },
    category: { type: 'event_category', notNull: true },
    poster_url: { type: 'text' },
    poster_public_id: { type: 'text' },
    venue: { type: 'text' },
    address: { type: 'text' },
    start_date: { type: 'timestamptz', notNull: true },
    end_date: { type: 'timestamptz', notNull: true },
    registration_deadline: { type: 'timestamptz', notNull: true },
    capacity: { type: 'integer', null: true },
    registered_count: { type: 'integer', notNull: true, default: 0 },
    status: { type: 'event_status', notNull: true, default: 'DRAFT' },
    created_by: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
      onDelete: 'RESTRICT',
    },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // Registrations Table
  pgm.createTable('registrations', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    event_id: {
      type: 'uuid',
      notNull: true,
      references: 'events(id)',
      onDelete: 'CASCADE',
    },
    status: { type: 'registration_status', notNull: true, default: 'CONFIRMED' },
    registered_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.addConstraint('registrations', 'unique_user_event_registration', {
    unique: ['user_id', 'event_id'],
  });

  // Passes Table
  pgm.createTable('passes', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    registration_id: {
      type: 'uuid',
      notNull: true,
      unique: true,
      references: 'registrations(id)',
      onDelete: 'CASCADE',
    },
    pass_code: { type: 'text', notNull: true, unique: true },
    qr_token: { type: 'text', notNull: true, unique: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // Check-ins Table
  pgm.createTable('check_ins', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    pass_id: {
      type: 'uuid',
      notNull: true,
      unique: true,
      references: 'passes(id)',
      onDelete: 'CASCADE',
    },
    checked_in_by: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
      onDelete: 'RESTRICT',
    },
    checked_in_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // Notifications Table
  pgm.createTable('notifications', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    type: { type: 'text', notNull: true },
    payload: { type: 'jsonb', notNull: true, default: '{}' },
    status: { type: 'notification_status', notNull: true, default: 'PENDING' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // Required Indexes per §5
  pgm.createIndex('users', 'email', { name: 'idx_users_email' });
  pgm.createIndex('events', 'slug', { name: 'idx_events_slug' });
  pgm.createIndex('events', 'college_id', { name: 'idx_events_college_id' });
  pgm.createIndex('events', 'start_date', { name: 'idx_events_start_date' });
  pgm.createIndex('events', 'category', { name: 'idx_events_category' });
  pgm.createIndex('events', 'status', { name: 'idx_events_status' });
  pgm.createIndex('registrations', 'user_id', { name: 'idx_registrations_user_id' });
  pgm.createIndex('registrations', 'event_id', { name: 'idx_registrations_event_id' });
  pgm.createIndex('passes', 'pass_code', { name: 'idx_passes_pass_code' });
  pgm.createIndex('passes', 'qr_token', { name: 'idx_passes_qr_token' });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable('notifications');
  pgm.dropTable('check_ins');
  pgm.dropTable('passes');
  pgm.dropTable('registrations');
  pgm.dropTable('events');
  pgm.dropTable('college_members');
  pgm.dropConstraint('users', 'fk_users_college_id');
  pgm.dropTable('colleges');
  pgm.dropTable('users');

  pgm.dropType('notification_status');
  pgm.dropType('registration_status');
  pgm.dropType('event_status');
  pgm.dropType('event_category');
  pgm.dropType('college_member_role');
  pgm.dropType('college_verification_status');
  pgm.dropType('user_status');
  pgm.dropType('user_role');
};
