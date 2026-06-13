import { Request, Response, NextFunction } from 'express';

// Simple Role‑Based Access Control placeholder
// Expected request.user.role to be set by authentication middleware

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = (req as any).user?.role;
    if (!role) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
};

// Usage example (in an Express router):
// router.get('/admin/data', requireRole(['admin']), handler);
