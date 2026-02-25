import { users, products, type User, type InsertUser, type Product, type InsertProduct } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product operations
  getAllProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct & { createdAt: string }): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Product filtering operations
  getCarModels(): Promise<string[]>;
  getTransmissionsByCarModel(carModel: string): Promise<string[]>;
  getMotorizationsByTransmission(carModel: string, transmission: string): Promise<string[]>;
  getYearsByMotorization(carModel: string, transmission: string, motorization: string): Promise<string[]>;
  getFilteredProducts(filters: {
    carModel?: string;
    transmission?: string;
    motorization?: string;
    year?: string;
  }): Promise<Product[]>;
  
  // All filter values (for admin form)
  getAllTransmissions(): Promise<string[]>;
  getAllMotorizations(): Promise<string[]>;
  getAllYears(): Promise<string[]>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Create a default admin user for testing
    this.createDefaultAdminUser();
  }

  /**
   * Helper to extract unique values from an array while preserving order.
   * Using a simple filter + indexOf approach avoids allocating a Set and
   * works with primitive types. This method can be reused by the various
   * filter functions below to eliminate duplicate strings.
   * 
   * @param values Array of primitive values (e.g. strings) to deduplicate
   * @returns Array containing only the first occurrence of each unique value
   */
  private getUniqueValues<T>(values: T[]): T[] {
    return values.filter((value, index, self) => self.indexOf(value) === index);
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
      .values({
        ...insertUser,
        isAdmin: insertUser.isAdmin === true
      })
      .returning();
    return user;
  }
  
  // Product methods
  async getAllProducts(): Promise<Product[]> {
    const allProducts = await db.select().from(products);
    return allProducts;
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }
  
  async createProduct(productData: InsertProduct & { createdAt: string }): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values({
        ...productData,
        imageUrl: productData.imageUrl || null
      })
      .returning();
    return product;
  }
  
  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set(productData)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct || undefined;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  
  // Product filtering methods
  async getCarModels(): Promise<string[]> {
    const result = await db
      .selectDistinct({ carModel: products.carModel })
      .from(products);
    return result.map(row => row.carModel);
  }
  
  async getTransmissionsByCarModel(carModel: string): Promise<string[]> {
    const result = await db
      .selectDistinct({ transmission: products.transmission })
      .from(products)
      .where(eq(products.carModel, carModel));
    return result.map(row => row.transmission);
  }
  
  async getMotorizationsByTransmission(carModel: string, transmission: string): Promise<string[]> {
    const result = await db
      .selectDistinct({ motorization: products.motorization })
      .from(products)
      .where(sql`${products.carModel} = ${carModel} AND ${products.transmission} = ${transmission}`);
    return result.map(row => row.motorization);
  }
  
  async getYearsByMotorization(carModel: string, transmission: string, motorization: string): Promise<string[]> {
    const result = await db
      .selectDistinct({ year: products.year })
      .from(products)
      .where(sql`${products.carModel} = ${carModel} AND ${products.transmission} = ${transmission} AND ${products.motorization} = ${motorization}`);
    return result.map(row => row.year);
  }
  
  async getFilteredProducts(filters: {
    carModel?: string;
    transmission?: string;
    motorization?: string;
    year?: string;
  }): Promise<Product[]> {
    const query = db.select().from(products);
    
    const conditions = [];
    if (filters.carModel) {
      conditions.push(eq(products.carModel, filters.carModel));
    }
    if (filters.transmission) {
      conditions.push(eq(products.transmission, filters.transmission));
    }
    if (filters.motorization) {
      conditions.push(eq(products.motorization, filters.motorization));
    }
    if (filters.year) {
      conditions.push(eq(products.year, filters.year));
    }
    
    if (conditions.length > 0) {
      return await query.where(sql.join(conditions, sql` AND `));
    }
    
    return await query;
  }
  
  // Get all unique transmissions
  async getAllTransmissions(): Promise<string[]> {
    const result = await db
      .selectDistinct({ transmission: products.transmission })
      .from(products);
    return result.map(row => row.transmission);
  }
  
  // Get all unique motorizations
  async getAllMotorizations(): Promise<string[]> {
    const result = await db
      .selectDistinct({ motorization: products.motorization })
      .from(products);
    return result.map(row => row.motorization);
  }
  
  // Get all unique years
  async getAllYears(): Promise<string[]> {
    const result = await db
      .selectDistinct({ year: products.year })
      .from(products);
    return result.map(row => row.year);
  }
}

export const storage = new DatabaseStorage();
