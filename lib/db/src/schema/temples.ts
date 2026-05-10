import { pgTable, text, timestamp, jsonb, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const templesTable = pgTable("temples", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  nameHindi: text("name_hindi").notNull(),
  description: text("description").notNull(),
  history: text("history"),
  timings: text("timings").notNull(),
  category: text("category"),
  images: jsonb("images").$type<string[]>().default([]),
  rules: jsonb("rules").$type<string[]>().default([]),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  address: text("address").notNull(),
  nearbyServices: jsonb("nearby_services").$type<string[]>().default([]),
  crowdLevel: text("crowd_level").default("low"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTempleSchema = createInsertSchema(templesTable).omit({ createdAt: true });
export type InsertTemple = z.infer<typeof insertTempleSchema>;
export type Temple = typeof templesTable.$inferSelect;
