import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";

export const qualityEnum = pgEnum("quality", ["excellent", "good", "average", "poor"]);
export const requestStatusEnum = pgEnum("request_status", ["pending", "approved", "rejected"]);

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  showEmpty: boolean("show_empty").notNull().default(true),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sites = pgTable("sites", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  url: text("url").notNull(),
  logoUrl: text("logo_url").default(""),
  description: text("description").default(""),
  categoryId: integer("category_id")
    .references(() => categories.id)
    .notNull(),
  quality: qualityEnum("quality").notNull().default("good"),
  clicks: integer("clicks").notNull().default(0),
  verified: boolean("verified").notNull().default(false),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  username: varchar("username", { length: 255 }),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const requests = pgTable("requests", {
  id: serial("id").primaryKey(),
  siteName: varchar("site_name", { length: 255 }).notNull(),
  siteUrl: text("site_url").notNull(),
  categoryId: integer("category_id")
    .references(() => categories.id)
    .notNull(),
  description: text("description").notNull(),
  status: requestStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const clicks = pgTable("clicks", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id")
    .references(() => sites.id)
    .notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  clickedAt: timestamp("clicked_at").defaultNow().notNull(),
});