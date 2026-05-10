import { pgTable, text, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const crowdZonesTable = pgTable("crowd_zones", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  level: text("level").notNull().default("low"),
  estimatedCount: integer("estimated_count").default(0),
  maxCapacity: integer("max_capacity").notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  radius: real("radius").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCrowdZoneSchema = createInsertSchema(crowdZonesTable).omit({ createdAt: true, updatedAt: true });
export type InsertCrowdZone = z.infer<typeof insertCrowdZoneSchema>;
export type CrowdZone = typeof crowdZonesTable.$inferSelect;
