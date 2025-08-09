// env.ts
import 'dotenv/config';
import type jwt from 'jsonwebtoken';

type ExpiresIn = jwt.SignOptions['expiresIn']; // number | `${number}${'ms'|'s'|'m'|'h'|'d'}`

function parseExpiresIn(v: string | undefined): ExpiresIn {
  if (!v) return '1d';
  const n = Number(v);
  return Number.isFinite(n) ? n : (v as ExpiresIn);
}

export const env = {
  PORT: Number(process.env.PORT || 45766),
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: (process.env.JWT_SECRET || 'dev-secret') as unknown as jwt.Secret,
  JWT_EXPIRES_IN: parseExpiresIn(process.env.JWT_EXPIRES_IN),
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME || 'creencia_sid'
};
