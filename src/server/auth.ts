import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from './db.js';
import { User, UserRole } from '../types/index.js';

const AUTH_SECRET = process.env.AUTH_SECRET || 'aimiddleman-secure-auth-secret-key-2026-prod';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function generateToken(user: User): string {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    issuedAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(body).digest('base64url');
  return `${body}.${signature}`;
}

export function verifyToken(token: string): { userId: string; role: UserRole } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [body, signature] = parts;
    const expectedSignature = crypto.createHmac('sha256', AUTH_SECRET).update(body).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (Date.now() > payload.expiresAt) {
      return null;
    }
    return { userId: payload.userId, role: payload.role };
  } catch {
    return null;
  }
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (decoded) {
    const user = db.getUserById(decoded.userId);
    if (user && user.status === 'active') {
      const { passwordHash, passwordSalt, ...safeUser } = user;
      req.user = safeUser;
    }
  }
  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Requires one of roles: ${roles.join(', ')}.` });
    }
    next();
  };
}
