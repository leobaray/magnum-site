import { users, products, type User, type InsertUser, type Product, type InsertProduct } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

export class DatabaseStorage {
  constructor() {
    this.createDefaultAdminUser();
  }

  private async createDefaultAdminUser() {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      if (process.env.NODE_ENV === 'production') {
        console.warn('AVISO: ADMIN_PASSWORD não configurado. Nenhum admin será criado automaticamente.');
      }
      return;
    }
    try {
      const existingUser = await this.getUserByUsername('admin');
      if (!existingUser) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);
        await this.createUser({ username: 'admin', password: hashedPassword, isAdmin: true });
        console.log('Admin criado com sucesso.');
      }
    } catch (error) {
      console.error('Erro ao criar admin:', error);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, isAdmin: insertUser.isAdmin === true })
      .returning();
    return user;
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return db.select().from(products);
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(productData: InsertProduct & { createdAt: string }): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values({ ...productData, imageUrl: productData.imageUrl || null })
      .returning();
    return product;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db
      .update(products)
      .set(productData)
      .where(eq(products.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Cascading filter methods (used by public catalog)
  async getCarModels(): Promise<string[]> {
    const rows = await db.selectDistinct({ carModel: products.carModel }).from(products);
    return rows.map(r => r.carModel);
  }

  async getTransmissionsByCarModel(carModel: string): Promise<string[]> {
    const rows = await db
      .selectDistinct({ transmission: products.transmission })
      .from(products)
      .where(eq(products.carModel, carModel));
    return rows.map(r => r.transmission);
  }

  async getMotorizationsByTransmission(carModel: string, transmission: string): Promise<string[]> {
    const rows = await db
      .selectDistinct({ motorization: products.motorization })
      .from(products)
      .where(sql`${products.carModel} = ${carModel} AND ${products.transmission} = ${transmission}`);
    return rows.map(r => r.motorization);
  }

  async getYearsByMotorization(carModel: string, transmission: string, motorization: string): Promise<string[]> {
    const rows = await db
      .selectDistinct({ year: products.year })
      .from(products)
      .where(sql`${products.carModel} = ${carModel} AND ${products.transmission} = ${transmission} AND ${products.motorization} = ${motorization}`);
    return rows.map(r => r.year);
  }

  async getFilteredProducts(filters: {
    carModel?: string;
    transmission?: string;
    motorization?: string;
    year?: string;
  }): Promise<Product[]> {
    const conditions = [];
    if (filters.carModel)     conditions.push(eq(products.carModel, filters.carModel));
    if (filters.transmission) conditions.push(eq(products.transmission, filters.transmission));
    if (filters.motorization) conditions.push(eq(products.motorization, filters.motorization));
    if (filters.year)         conditions.push(eq(products.year, filters.year));

    const query = db.select().from(products);
    return conditions.length > 0 ? query.where(sql.join(conditions, sql` AND `)) : query;
  }

  // All-values methods (used by admin form)
  async getAllTransmissions(): Promise<string[]> {
    const rows = await db.selectDistinct({ transmission: products.transmission }).from(products);
    return rows.map(r => r.transmission);
  }

  async getAllMotorizations(): Promise<string[]> {
    const rows = await db.selectDistinct({ motorization: products.motorization }).from(products);
    return rows.map(r => r.motorization);
  }

  async getAllYears(): Promise<string[]> {
    const rows = await db.selectDistinct({ year: products.year }).from(products);
    return rows.map(r => r.year);
  }
}

export const storage = new DatabaseStorage();
