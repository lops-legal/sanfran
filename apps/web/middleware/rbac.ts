import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string };
    }
  }
}

/** Blocks until JWT/session auth populates req.user. */
export const requireRole = (_roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.id || !req.user?.role) {
      return res.status(501).json({
        error: "Autenticação não configurada. Endpoint bloqueado por segurança.",
      });
    }
    if (!_roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Permissão insuficiente." });
    }
    next();
  };
};
