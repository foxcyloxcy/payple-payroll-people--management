import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// A bounded, revisioned aggregate keeps each first-release operation atomic.
// Normalize append-heavy records before scaling beyond the documented limits.
export const workspaces = sqliteTable('payple_workspaces', {
  id: text('id').primaryKey(),
  payload: text('payload').notNull(),
  revision: integer('revision').notNull().default(1),
  updatedAt: text('updated_at').notNull(),
});
