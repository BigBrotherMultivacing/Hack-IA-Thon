import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface JWTPayload { id: number; email: string; name: string; }

export function signToken(payload: JWTPayload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization?.split(' ');
  const bearer = header && header[0] === 'Bearer' ? header[1] : undefined;
  const cookie = (req as any).cookies?.[env.SESSION_COOKIE_NAME] as string | undefined;
  const token = bearer || cookie;

  if (!token) return res.status(401).json({ message: 'No autorizado' });

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    (req as any).user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}
