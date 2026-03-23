import type { Express } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Muitas tentativas de login. Tente novamente em 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await storage.getUserByUsername(username);
    if (!user) return done(null, false, { message: "Usuário não encontrado" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return done(null, false, { message: "Senha incorreta" });

    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export function setupAuth(app: Express): void {
  app.post("/api/auth/login", loginLimiter, (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: info?.message || "Credenciais inválidas.",
        });
      }
      req.login(user, (loginErr: any) => {
        if (loginErr) return next(loginErr);
        const { password: _p, ...userWithoutPassword } = user;
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
        return res.status(500).json({ success: false, message: "Erro ao fazer logout." });
      }
      res.status(200).json({ success: true, message: "Logout realizado com sucesso!" });
    });
  });

  app.get("/api/auth/status", (req, res) => {
    if (typeof req.isAuthenticated === "function" && req.isAuthenticated()) {
      const user: any = req.user;
      if (user) {
        const { password: _p, ...userWithoutPassword } = user;
        return res.status(200).json({ isAuthenticated: true, user: userWithoutPassword });
      }
    }
    res.status(200).json({ isAuthenticated: false });
  });
}
