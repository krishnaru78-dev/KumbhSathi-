import { pgTable, text, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const lostFoundTable = pgTable("lost_found", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  status: text("status").notNull().default("open"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  name: text("name"),
  age: integer("age"),
  gender: text("gender"),
  lastSeenLocation: text("last_seen_location").notNull(),
  lastSeenTime: timestamp("last_seen_time").notNull(),
  photos: jsonb("photos").$type<string[]>().default([]),
  contactName: text("contact_name").notNull(),
  contactPhone: text("contact_phone").notNull(),
  reportedBy: text("reported_by").notNull(),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLostFoundSchema = createInsertSchema(lostFoundTable).omit({ createdAt: true, updatedAt: true });
export type InsertLostFound = z.infer<typeof insertLostFoundSchema>;
export type LostFound = typeof lostFoundTable.$inferSelect;
