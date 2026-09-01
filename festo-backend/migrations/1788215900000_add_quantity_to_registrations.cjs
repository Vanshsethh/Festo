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
  // Add quantity column to registrations table using raw SQL
  pgm.sql('ALTER TABLE "registrations" ADD COLUMN "quantity" INTEGER NOT NULL DEFAULT 1');

  // Update existing registrations to have quantity = 1 (though default should handle this)
  pgm.sql('UPDATE registrations SET quantity = 1 WHERE quantity IS NULL');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  // Remove quantity column from registrations table
  pgm.sql('ALTER TABLE "registrations" DROP COLUMN "quantity"');
};