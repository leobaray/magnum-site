import type { Express } from "express";
import { createServer, type Server } from "http";
import { isAdmin } from "./middlewares/isAdmin";
// registerContactRoutes removed: contact messages are now sent via WhatsApp
import { registerProductRoutes } from "./api/productRoutes";
import { registerAuthRoutes } from "./api/authRoutes";

/**
 * Central entry point for API route registration.
 *
 * This function wires up the various route modules (contact, products,
 * authentication) on the provided Express application.  It also
 * constructs and returns an underlying Node HTTP server to be used by
 * the rest of the application (e.g. for Vite integration).  Keeping
 * route registration modular improves readability and makes it easier
 * to test individual route groups in isolation.
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // Register each route group.  The product routes receive the
  // isAdmin middleware, which lives in a dedicated module.
  // registerContactRoutes(app); // removed, contact form no longer posts to backend
  registerProductRoutes(app, isAdmin);
  registerAuthRoutes(app);

  // Create and return the underlying HTTP server.  Express does not
  // expose the server instance directly, so we construct it here and
  // return it to the caller.  The caller is responsible for calling
  // listen() on this server.
  return createServer(app);
}