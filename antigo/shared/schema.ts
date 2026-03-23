import { pgTable, text, serial, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false),
});

export const insertUserSchema = createInsertSchema(users, {
  isAdmin: z.boolean().optional().default(false)
}).pick({
  username: true,
  password: true,
  isAdmin: true,
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  carModel: text("car_model").notNull(),
  transmission: text("transmission").notNull(),
  motorization: text("motorization").notNull(),
  year: text("year").notNull(),
  imageUrl: text("image_url"),
  createdAt: text("created_at").notNull(),
});

export const insertProductSchema = createInsertSchema(products, {
  imageUrl: z.string().nullable().optional().default(null)
}).pick({
  name: true,
  description: true,
  carModel: true,
  transmission: true,
  motorization: true,
  year: true,
  imageUrl: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
