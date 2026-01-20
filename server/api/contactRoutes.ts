import type { Express } from "express";
import { storage } from "../storage";
import { insertContactSchema } from "@shared/schema";

/**
 * Registers the contact form API endpoint on the provided Express app.
 *
 * This route validates the incoming request body against the
 * `insertContactSchema` and, on success, records the message in the
 * in‑memory storage with a timestamp.  Validation errors result in a
 * 400 response with a generic error message; any other unexpected
 * exceptions yield a 500 response.
 */
export function registerContactRoutes(app: Express): void {
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contactData = {
        ...validatedData,
        createdAt: new Date().toISOString(),
      };
      await storage.createContactMessage(contactData);
      res.status(200).json({
        success: true,
        message: "Mensagem enviada com sucesso!",
      });
    } catch (error) {
      console.error("Error processing contact form:", error);
      res.status(400).json({
        success: false,
        message: "Erro ao processar o formulário.",
      });
    }
  });
}