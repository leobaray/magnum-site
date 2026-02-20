import type { Request, Response, NextFunction } from "express";

/**
 * Middleware to ensure the user is authenticated and has admin privileges.
 *
 * This middleware checks two conditions:
 * 1. The request must be associated with an authenticated user, i.e. `req.isAuthenticated()`
 *    must be defined and return `true`.
 * 2. The authenticated user must have the `isAdmin` flag set to `true`.
 *
 * If either of these checks fail the middleware responds with an appropriate
 * HTTP status code (401 for unauthenticated, 403 for non‑admin) and aborts
 * further processing. Otherwise the request proceeds to the next handler.
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  // Check if the authentication function exists and if the user is logged in.
  if (typeof req.isAuthenticated !== "function" || !req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      message: "Você precisa estar autenticado para acessar esta área",
    });
  }

  // Retrieve the user from the request.  The passport typings are not strict
  // enough to infer a concrete type here so we fall back to `any`.
  const user: any = req.user;

  // Ensure the user exists and has the admin flag set to true.
  if (!user || user.isAdmin !== true) {
    return res.status(403).json({
      success: false,
      message: "Você não tem permissão para acessar esta área",
    });
  }

  // Everything checks out; allow the request to continue.
  return next();
}