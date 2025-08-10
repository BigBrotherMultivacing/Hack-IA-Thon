// Tipos de Request, Response y NextFunction de Express
import { Request, Response, NextFunction } from 'express';
// Librería JWT para firmar/verificar tokens
import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
// Configuración de variables de entorno
import { env } from '../config/env.js';

// Interfaz para tipar la información que irá dentro del JWT
export interface JWTPayload { id: number; email: string; name: string; }

// Función para generar un token JWT con los datos del usuario
export function signToken(payload: JWTPayload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

// Middleware que exige autenticación por JWT
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Intenta obtener el token desde la cabecera Authorization: Bearer <token>
  const header = req.headers.authorization?.split(' ');
  const bearer = header && header[0] === 'Bearer' ? header[1] : undefined;

  // O desde la cookie de sesión configurada
  const cookie = (req as any).cookies?.[env.SESSION_COOKIE_NAME] as string | undefined;

  // El token será el que venga en Bearer o en la cookie
  const token = bearer || cookie;

  // Si no hay token, el usuario no está autorizado
  if (!token) return res.status(401).json({ message: 'No autorizado' });

  try {
    // Verifica y decodifica el token
    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    // Guarda los datos del usuario en la request para uso posterior
    (req as any).user = decoded;
    next();
  } catch {
    // Si el token es inválido o está expirado, devuelve error
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}
