import { pgTable, text, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique(),
  phone: text("phone"),
  avatar: text("avatar"),
  language: text("language").notNull().default("hi"),
  role: text("role").notNull().default("user"),
  passwordHash: text("password_hash"),
  emergencyContacts: jsonb("emergency_contacts").$type<{id:string;name:string;phone:string;relation:string}[]>().default([]),
  medicalInfo: jsonb("medical_info").$type<{bloodGroup?:string;allergies?:string;conditions?:string;medications?:string}>(),
  isGuest: boolean("is_guest").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
