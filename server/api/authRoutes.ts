import type { Express } from "express";
import passport from "passport";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,                   // máximo 10 tentativas por IP
  message: { success: false, message: "Muitas tentativas de login. Tente novamente em 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

/** Registers authentication routes on the provided Express app. */
export function registerAuthRoutes(app: Express): void {
  app.post("/api/auth/login", loginLimiter, (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({
          success: false,
          message: info?.message || "Credenciais inválidas.",
        });
      }
      req.login(user, (loginErr: any) => {
        if (loginErr) {
          return next(loginErr);
        }
        const { password: _discarded, ...userWithoutPassword } = user;
        return res.status(200).json({
          success: true,
          message: "Login realizado com sucesso!",
          user: userWithoutPassword,
        });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Erro ao fazer logout.",
        });
      }
      res.status(200).json({
        success: true,
        message: "Logout realizado com sucesso!",
      });
    });
  });

  /**
   * Endpoint to check the current authentication status.
   *
   * Returns `{ isAuthenticated: true, user: { ... } }` when a user
   * session is active.  When no session exists the response is
   * `{ isAuthenticated: false }`.  This route mirrors the behaviour of
   * the original implementation and is used by the client to
   * determine whether a user is logged in and whether they have
   * administrative privileges.  Passwords are never returned.
   */
  app.get("/api/auth/status", (req, res) => {
    // Check if passport has attached the user to the request
    if (typeof req.isAuthenticated === "function" && req.isAuthenticated()) {
      const user: any = req.user;
      if (user) {
        const { password: _discarded, ...userWithoutPassword } = user;
        return res.status(200).json({
          isAuthenticated: true,
          user: userWithoutPassword,
        });
      }
    }
    res.status(200).json({
      isAuthenticated: false,
    });
  });
}