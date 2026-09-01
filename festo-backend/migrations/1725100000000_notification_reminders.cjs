exports.up = (pgm) => {
  pgm.sql(`CREATE UNIQUE INDEX notifications_event_reminder_unique ON notifications (user_id, type, (payload->>'event_id')) WHERE type = 'EVENT_REMINDER';`);
};

exports.down = (pgm) => {
  pgm.sql('DROP INDEX IF EXISTS notifications_event_reminder_unique;');
};
