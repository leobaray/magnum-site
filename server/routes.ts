import type { Express } from "express";
import { createServer, type Server } from "http";
import { isAdmin } from "./middlewares/isAdmin";
import { registerProductRoutes } from "./api/productRoutes";
import { registerAuthRoutes } from "./api/authRoutes";

/** Registra todas as rotas da API e retorna o servidor HTTP. */
export async function registerRoutes(app: Express): Promise<Server> {
  // Health check — usado por nginx, PM2 e monitores de uptime
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  registerProductRoutes(app, isAdmin);
  registerAuthRoutes(app);

  // Create and return the underlying HTTP server.  Express does not
  // expose the server instance directly, so we construct it here and
  // return it to the caller.  The caller is responsible for calling
  // listen() on this server.
  return createServer(app);
}