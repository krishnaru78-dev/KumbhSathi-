import { pgTable, text, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sosIncidentsTable = pgTable("sos_incidents", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  userName: text("user_name"),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  message: text("message"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSOSSchema = createInsertSchema(sosIncidentsTable).omit({ createdAt: true, updatedAt: true });
export type InsertSOS = z.infer<typeof insertSOSSchema>;
export type SOSIncident = typeof sosIncidentsTable.$inferSelect;
