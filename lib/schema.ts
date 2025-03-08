import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  json,
  varchar,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  password: text("password"),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  authProvider: varchar("auth_provider", { length: 20 }).notNull(), // 'credentials' or 'google'
  emailNotificationsEnabled: boolean("email_notifications_enabled")
    .default(true)
    .notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

export const automations = pgTable("automations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  platform: varchar("platform", { length: 20 }).notNull(), // 'INSTAGRAM', 'FACEBOOK', 'TIKTOK', 'THREADS'
  isActive: boolean("is_active").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  userId: serial("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  settings: json("settings"),
  aiEnabled: boolean("ai_enabled").default(false).notNull(),
  aiPrompt: text("ai_prompt"),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  automationId: serial("automation_id")
    .notNull()
    .references(() => automations.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  isAiGenerated: boolean("is_ai_generated").default(false).notNull(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  automationId: serial("automation_id")
    .notNull()
    .references(() => automations.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  isAiGenerated: boolean("is_ai_generated").default(false).notNull(),
});

// Add this new table for social connections
export const socialConnections = pgTable("social_connections", {
  id: serial("id").primaryKey(),
  userId: serial("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  platform: varchar("platform", { length: 20 }).notNull(), // 'INSTAGRAM', 'FACEBOOK', etc.
  accessToken: text("access_token").notNull(),
  platformUserId: text("platform_user_id").notNull(),
  platformUserName: text("platform_user_name"),
  platformUserAvatar: text("platform_user_avatar"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  automations: many(automations),
  socialConnections: many(socialConnections),
}));

export const automationsRelations = relations(automations, ({ one, many }) => ({
  user: one(users, {
    fields: [automations.userId],
    references: [users.id],
  }),
  messages: many(messages),
  comments: many(comments),
}));
