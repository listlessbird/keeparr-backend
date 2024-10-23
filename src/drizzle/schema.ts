import {
  AnyPgColumn,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

export const userTable = pgTable('user', {
  id: text('id').primaryKey(),
  username: text('username').unique(),
  hashed_password: text('password'),
  email: text('email').unique(),
})

export const sessionTable = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => userTable.id),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
})

export const notesTable = pgTable('notes', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => userTable.id),
  title: text('title'),
  directoryId: uuid('directory_id').references(() => notesDirectoryTable.id),
  s3_key: text('s3_path'),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'date',
  })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'date',
  })
    .notNull()
    .defaultNow(),
})

export const notesDirectoryTable = pgTable('notes_directory', {
  //             ^?
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  name: text('name'),
  userId: uuid('user_id')
    .defaultRandom()
    .notNull()
    .references(() => userTable.id),
  parentdirectoryId: text('parent_directory_id').references(
    // https://github.com/drizzle-team/drizzle-orm/issues/1607
    (): AnyPgColumn => notesDirectoryTable.id,
  ),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})
