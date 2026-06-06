import { pgTable, uuid, text, timestamp, numeric, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (Developers logging into dashboard)
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  password: text('password').notNull(), // hashed
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Merchant Profiles (VPA details and connection credentials)
export const merchantProfiles = pgTable('merchant_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  merchantName: text('merchant_name').notNull(),
  email: text('email').notNull(),
  upiId: text('upi_id').notNull(), // e.g. merchant@okaxis
  merchantCode: text('merchant_code').notNull().unique(), // 6-digit alphanumeric pairing and sync code (e.g. OP8891)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Devices (Paired companion Android apps)
export const devices = pgTable('devices', {
  id: uuid('id').defaultRandom().primaryKey(),
  merchantProfileId: uuid('merchant_profile_id').references(() => merchantProfiles.id, { onDelete: 'cascade' }).notNull(),
  deviceId: text('device_id').notNull().unique(), // unique hardware app ID
  deviceName: text('device_name').notNull(), // Pixel 6, etc.
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Raw incoming transactions uploaded from devices
export const transactions = pgTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  deviceId: uuid('device_id').references(() => devices.id, { onDelete: 'set null' }),
  merchantProfileId: uuid('merchant_profile_id').references(() => merchantProfiles.id, { onDelete: 'cascade' }).notNull(),
  utr: text('utr'), // UPI Reference Number extracted
  amount: numeric('amount', { precision: 10, scale: 2 }), // pre-parsed or AI extracted amount
  rawSms: text('raw_sms').notNull(),
  sender: text('sender'), // Bank sender code (e.g., AD-HDFCBK)
  timestamp: timestamp('timestamp').notNull(), // When SMS occurred
  status: text('status').default('ignored').notNull(), // 'parsed', 'ignored', 'failed'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// AI Decisions log (Structured transaction parsing details)
export const aiDecisions = pgTable('ai_decisions', {
  id: uuid('id').defaultRandom().primaryKey(),
  transactionId: uuid('transaction_id').references(() => transactions.id, { onDelete: 'cascade' }).notNull(),
  isCredit: boolean('is_credit').notNull(), // true if credit transaction
  parsedAmount: numeric('parsed_amount', { precision: 10, scale: 2 }),
  parsedUtr: text('parsed_utr'),
  parsedSender: text('parsed_sender'),
  confidence: numeric('confidence', { precision: 3, scale: 2 }).notNull(),
  reasoning: jsonb('reasoning').notNull(), // array of reasoning steps
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Webhook configurations
export const webhooks = pgTable('webhooks', {
  id: uuid('id').defaultRandom().primaryKey(),
  merchantProfileId: uuid('merchant_profile_id').references(() => merchantProfiles.id, { onDelete: 'cascade' }).notNull(),
  url: text('url').notNull(),
  secret: text('secret').notNull(), // Signing secret for HMAC SHA256
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- Relations ---

export const usersRelations = relations(users, ({ many }) => ({
  merchantProfiles: many(merchantProfiles),
}));

export const merchantProfilesRelations = relations(merchantProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [merchantProfiles.userId],
    references: [users.id],
  }),
  devices: many(devices),
  transactions: many(transactions),
  webhooks: many(webhooks),
}));

export const devicesRelations = relations(devices, ({ one, many }) => ({
  merchantProfile: one(merchantProfiles, {
    fields: [devices.merchantProfileId],
    references: [merchantProfiles.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  device: one(devices, {
    fields: [transactions.deviceId],
    references: [devices.id],
  }),
  merchantProfile: one(merchantProfiles, {
    fields: [transactions.merchantProfileId],
    references: [merchantProfiles.id],
  }),
  aiDecisions: many(aiDecisions),
}));

export const aiDecisionsRelations = relations(aiDecisions, ({ one }) => ({
  transaction: one(transactions, {
    fields: [aiDecisions.transactionId],
    references: [transactions.id],
  }),
}));

export const webhooksRelations = relations(webhooks, ({ one }) => ({
  merchantProfile: one(merchantProfiles, {
    fields: [webhooks.merchantProfileId],
    references: [merchantProfiles.id],
  }),
}));
