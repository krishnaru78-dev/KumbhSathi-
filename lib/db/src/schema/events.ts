import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const eventsTable = pgTable("events", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  titleHindi: text("title_hindi").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  location: text("location").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  isShahiSnan: boolean("is_shahi_snan").default(false),
  importance: text("importance").default("medium"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bathingDatesTable = pgTable("bathing_dates", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  nameHindi: text("name_hindi").notNull(),
  date: text("date").notNull(),
  isShahiSnan: boolean("is_shahi_snan").default(false),
  significance: text("significance").notNull(),
  expectedCrowd: text("expected_crowd").default("high"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEventSchema = createInsertSchema(eventsTable).omit({ createdAt: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof eventsTable.$inferSelect;

export const insertBathingDateSchema = createInsertSchema(bathingDatesTable).omit({ createdAt: true });
export type InsertBathingDate = z.infer<typeof insertBathingDateSchema>;
export type BathingDate = typeof bathingDatesTable.$inferSelect;
