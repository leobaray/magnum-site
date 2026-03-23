import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { insertProductSchema } from "@shared/schema";
import * as z from "zod";
import * as fs from "fs";
import * as path from "path";
import multer from "multer";

function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (typeof req.isAuthenticated !== "function" || !req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: "Você precisa estar autenticado para acessar esta área" });
  }
  const user: any = req.user;
  if (!user || user.isAdmin !== true) {
    return res.status(403).json({ success: false, message: "Você não tem permissão para acessar esta área" });
  }
  return next();
}

const uploadStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(process.cwd(), "public", "products");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
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

export function registerProductRoutes(app: Express): void {
  // List all products
  app.get("/api/products", async (_req, res) => {
    try {
      res.status(200).json(await storage.getAllProducts());
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ success: false, message: "Erro ao buscar os produtos." });
    }
  });

  // Filter products — MUST be before /api/products/:id to avoid route conflict
  app.get("/api/products/filter", async (req: Request, res) => {
    try {
      const { carModel, transmission, motorization, year } = req.query;
      const products = await storage.getFilteredProducts({
        carModel: carModel as string | undefined,
        transmission: transmission as string | undefined,
        motorization: motorization as string | undefined,
        year: year as string | undefined,
      });
      res.status(200).json(products);
    } catch (error) {
      console.error("Error filtering products:", error);
      res.status(500).json({ success: false, message: "Erro ao filtrar os produtos." });
    }
  });

  // Get single product by id
  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProductById(parseInt(req.params.id, 10));
      if (!product) return res.status(404).json({ success: false, message: "Produto não encontrado." });
      res.status(200).json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ success: false, message: "Erro ao buscar o produto." });
    }
  });

  // Create product (admin only)
  app.post("/api/products", isAdmin, async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const newProduct = await storage.createProduct({ ...validatedData, createdAt: new Date().toISOString() });
      res.status(201).json({ success: true, message: "Produto criado com sucesso!", product: newProduct });
    } catch (error) {
      console.error("Error creating product:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ success: false, message: "Erro ao criar o produto." });
    }
  });

  // Update product (admin only)
  app.put("/api/products/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (!await storage.getProductById(id)) {
        return res.status(404).json({ success: false, message: "Produto não encontrado." });
      }
      const updatedProduct = await storage.updateProduct(id, req.body);
      res.status(200).json({ success: true, message: "Produto atualizado com sucesso!", product: updatedProduct });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ success: false, message: "Erro ao atualizar o produto." });
    }
  });

  // Delete product (admin only)
  app.delete("/api/products/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (!await storage.getProductById(id)) {
        return res.status(404).json({ success: false, message: "Produto não encontrado." });
      }
      await storage.deleteProduct(id);
      res.status(200).json({ success: true, message: "Produto excluído com sucesso!" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ success: false, message: "Erro ao excluir o produto." });
    }
  });

  // List product images (no auth — needed for the admin form image picker)
  app.get("/api/product-images", async (_req, res) => {
    try {
      const productsDir = path.join(process.cwd(), "public", "products");
      if (!fs.existsSync(productsDir)) return res.status(200).json([]);
      const files = fs.readdirSync(productsDir);
      const imagePaths = files
        .filter(f => [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(path.extname(f).toLowerCase()))
        .map(f => `/products/${f}`);
      res.status(200).json(imagePaths);
    } catch (error) {
      console.error("Error fetching product images:", error);
      res.status(500).json({ success: false, message: "Erro ao buscar as imagens de produtos." });
    }
  });

  // Upload image (admin only)
  app.post("/api/upload-image", isAdmin, upload.single("image"), (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: "Nenhum arquivo enviado." });
      res.status(200).json({ success: true, message: "Imagem enviada com sucesso!", path: `/products/${req.file.filename}` });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ success: false, message: "Erro ao enviar a imagem." });
    }
  });

  // Cascading filter endpoints (public catalog)
  app.get("/api/filters/car-models", async (_req, res) => {
    try {
      res.status(200).json(await storage.getCarModels());
    } catch (error) {
      console.error("Error fetching car models:", error);
      res.status(500).json({ success: false, message: "Erro ao buscar os modelos de carro." });
    }
  });

  app.get("/api/filters/transmissions/:carModel", async (req, res) => {
    try {
      res.status(200).json(await storage.getTransmissionsByCarModel(req.params.carModel));
    } catch (error) {
      console.error("Error fetching transmissions:", error);
      res.status(500).json({ success: false, message: "Erro ao buscar as transmissões." });
    }
  });

  app.get("/api/filters/motorizations/:carModel/:transmission", async (req, res) => {
    try {
      const { carModel, transmission } = req.params;
      res.status(200).json(await storage.getMotorizationsByTransmission(carModel, transmission));
    } catch (error) {
      console.error("Error fetching motorizations:", error);
      res.status(500).json({ success: false, message: "Erro ao buscar as motorizações." });
    }
  });

  app.get("/api/filters/years/:carModel/:transmission/:motorization", async (req, res) => {
    try {
      const { carModel, transmission, motorization } = req.params;
      res.status(200).json(await storage.getYearsByMotorization(carModel, transmission, motorization));
    } catch (error) {
      console.error("Error fetching years:", error);
      res.status(500).json({ success: false, message: "Erro ao buscar os anos." });
    }
  });

  // All-values endpoints (admin form dropdowns)
  app.get("/api/filters/all-transmissions", async (_req, res) => {
    try {
      res.status(200).json(await storage.getAllTransmissions());
    } catch (error) {
      console.error("Error fetching all transmissions:", error);
      res.status(500).json({ success: false, message: "Erro ao buscar as transmissões." });
    }
  });

  app.get("/api/filters/all-motorizations", async (_req, res) => {
    try {
      res.status(200).json(await storage.getAllMotorizations());
    } catch (error) {
      console.error("Error fetching all motorizations:", error);
      res.status(500).json({ success: false, message: "Erro ao buscar as motorizações." });
    }
  });

  app.get("/api/filters/all-years", async (_req, res) => {
    try {
      res.status(200).json(await storage.getAllYears());
    } catch (error) {
      console.error("Error fetching all years:", error);
      res.status(500).json({ success: false, message: "Erro ao buscar os anos." });
    }
  });
}
