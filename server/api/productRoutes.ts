import type { Express, Request } from "express";
import { storage } from "../storage";
import { insertProductSchema } from "@shared/schema";
import * as z from "zod";
import * as fs from "fs";
import * as path from "path";
import multer from "multer";

const uploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(process.cwd(), "public", "products");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, "_");
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Tipo de arquivo não permitido. Use JPG, PNG, GIF ou WebP."));
    }
  },
});

/**
 * Registers all product‑related API endpoints on the provided Express app.
 *
 * The `isAdmin` middleware should be provided by the caller and is used to
 * protect routes that modify state (create, update, delete, and list
 * product images).  Read‑only routes such as fetching products or
 * product filters do not require admin privileges.
 */
export function registerProductRoutes(app: Express, isAdmin: any): void {
  // List all products
  app.get("/api/products", async (_req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.status(200).json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({
        success: false,
        message: "Erro ao buscar os produtos.",
      });
    }
  });

  // Filter products - MUST be before /api/products/:id to avoid route conflict
  app.get("/api/products/filter", async (req: Request, res) => {
    try {
      const { carModel, transmission, motorization, year } = req.query;
      const filters = {
        carModel: carModel as string | undefined,
        transmission: transmission as string | undefined,
        motorization: motorization as string | undefined,
        year: year as string | undefined,
      };
      const products = await storage.getFilteredProducts(filters);
      res.status(200).json(products);
    } catch (error) {
      console.error("Error filtering products:", error);
      res.status(500).json({
        success: false,
        message: "Erro ao filtrar os produtos.",
      });
    }
  });

  // Get single product by id
  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const product = await storage.getProductById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Produto não encontrado.",
        });
      }
      res.status(200).json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({
        success: false,
        message: "Erro ao buscar o produto.",
      });
    }
  });

  // Create product (admin only)
  app.post("/api/products", isAdmin, async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const productData = {
        ...validatedData,
        createdAt: new Date().toISOString(),
      };
      const newProduct = await storage.createProduct(productData);
      res.status(201).json({
        success: true,
        message: "Produto criado com sucesso!",
        product: newProduct,
      });
    } catch (error) {
      console.error("Error creating product:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Dados inválidos",
          errors: error.errors,
        });
      }
      res.status(500).json({
        success: false,
        message: "Erro ao criar o produto.",
      });
    }
  });

  // Update product (admin only)
  app.put("/api/products/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const product = await storage.getProductById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Produto não encontrado.",
        });
      }
      const updatedProduct = await storage.updateProduct(id, req.body);
      res.status(200).json({
        success: true,
        message: "Produto atualizado com sucesso!",
        product: updatedProduct,
      });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({
        success: false,
        message: "Erro ao atualizar o produto.",
      });
    }
  });

  // Delete product (admin only)
  app.delete("/api/products/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const product = await storage.getProductById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Produto não encontrado.",
        });
      }
      await storage.deleteProduct(id);
      res.status(200).json({
        success: true,
        message: "Produto excluído com sucesso!",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({
        success: false,
        message: "Erro ao excluir o produto.",
      });
    }
  });

  // List product images in public/products (no auth required for form loading)
  app.get("/api/product-images", async (_req, res) => {
    try {
      const productsDir = path.join(process.cwd(), "public", "products");
      if (!fs.existsSync(productsDir)) {
        return res.status(200).json([]);
      }
      const files = fs.readdirSync(productsDir);
      const imageFiles = files.filter((file: string) => {
        const ext = path.extname(file).toLowerCase();
        return [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext);
      });
      const imagePaths = imageFiles.map((file: string) => `/products/${file}`);
      res.status(200).json(imagePaths);
    } catch (error) {
      console.error("Error fetching product images:", error);
      res.status(500).json({
        success: false,
        message: "Erro ao buscar as imagens de produtos.",
      });
    }
  });

  // Upload image (admin only)
  app.post("/api/upload-image", isAdmin, upload.single("image"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Nenhum arquivo enviado.",
        });
      }
      const imagePath = `/products/${req.file.filename}`;
      res.status(200).json({
        success: true,
        message: "Imagem enviada com sucesso!",
        path: imagePath,
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({
        success: false,
        message: "Erro ao enviar a imagem.",
      });
    }
  });

  // Get all unique transmissions (for admin form)
  app.get("/api/filters/all-transmissions", async (_req, res) => {
    try {
      const transmissions = await storage.getAllTransmissions();
      res.status(200).json(transmissions);
    } catch (error) {
      console.error("Error fetching all transmissions:", error);
      res.status(500).json({
        success: false,
        message: "Erro ao buscar as transmissões.",
      });
    }
  });

  // Get all unique motorizations (for admin form)
  app.get("/api/filters/all-motorizations", async (_req, res) => {
    try {
      const motorizations = await storage.getAllMotorizations();
      res.status(200).json(motorizations);
    } catch (error) {
      console.error("Error fetching all motorizations:", error);
      res.status(500).json({
        success: false,
        message: "Erro ao buscar as motorizações.",
      });
    }
  });

  // Get all unique years (for admin form)
  app.get("/api/filters/all-years", async (_req, res) => {
    try {
      const years = await storage.getAllYears();
      res.status(200).json(years);
    } catch (error) {
      console.error("Error fetching all years:", error);
      res.status(500).json({
        success: false,
        message: "Erro ao buscar os anos.",
      });
    }
  });

  // Filtering endpoints
  app.get("/api/filters/car-models", async (_req, res) => {
    try {
      const carModels = await storage.getCarModels();
      res.status(200).json(carModels);
    } catch (error) {
      console.error("Error fetching car models:", error);
      res.status(500).json({
        success: false,
        message: "Erro ao buscar os modelos de carro.",
      });
    }
  });

  app.get("/api/filters/transmissions/:carModel", async (req, res) => {
    try {
      const { carModel } = req.params;
      const transmissions = await storage.getTransmissionsByCarModel(carModel);
      res.status(200).json(transmissions);
    } catch (error) {
      console.error("Error fetching transmissions:", error);
      res.status(500).json({
        success: false,
        message: "Erro ao buscar as transmissões.",
      });
    }
  });

  app.get("/api/filters/motorizations/:carModel/:transmission", async (req, res) => {
    try {
      const { carModel, transmission } = req.params;
      const motorizations = await storage.getMotorizationsByTransmission(carModel, transmission);
      res.status(200).json(motorizations);
    } catch (error) {
      console.error("Error fetching motorizations:", error);
      res.status(500).json({
        success: false,
        message: "Erro ao buscar as motorizações.",
      });
    }
  });

  app.get("/api/filters/years/:carModel/:transmission/:motorization", async (req, res) => {
    try {
      const { carModel, transmission, motorization } = req.params;
      const years = await storage.getYearsByMotorization(carModel, transmission, motorization);
      res.status(200).json(years);
    } catch (error) {
      console.error("Error fetching years:", error);
      res.status(500).json({
        success: false,
        message: "Erro ao buscar os anos.",
      });
    }
  });
}