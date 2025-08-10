// Carga automáticamente las variables de entorno desde un archivo .env
import 'dotenv/config';
// Importa tipos de la librería jsonwebtoken para tipar el valor de 'expiresIn'
import type jwt from 'jsonwebtoken';

// Tipo que representa los formatos válidos para la propiedad 'expiresIn' de JWT
// Puede ser un número (segundos) o una cadena con sufijo de tiempo: 'ms', 's', 'm', 'h', 'd'
type ExpiresIn = jwt.SignOptions['expiresIn'];

// Función auxiliar para procesar la variable de expiración del token JWT
function parseExpiresIn(v: string | undefined): ExpiresIn {
  // Si no hay valor, usar '1d' (1 día)
  if (!v) return '1d';
  const n = Number(v);
  // Si se puede convertir a número, usarlo directamente, si no, devolver el string original
  return Number.isFinite(n) ? n : (v as ExpiresIn);
}

// Objeto 'env' que centraliza y tipa las variables de entorno usadas en la app
export const env = {
  // Puerto en el que se levantará el servidor
  PORT: Number(process.env.PORT || 45766),
  // Entorno de ejecución ('development', 'production', etc.)
  NODE_ENV: process.env.NODE_ENV || 'development',
  // Clave secreta para firmar/verificar JWT
  JWT_SECRET: (process.env.JWT_SECRET || 'dev-secret') as unknown as jwt.Secret,
  // Tiempo de expiración de los JWT, procesado con parseExpiresIn
  JWT_EXPIRES_IN: parseExpiresIn(process.env.JWT_EXPIRES_IN),
  // Origen permitido para CORS (frontend)
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  // Nombre de la cookie de sesión que se enviará al cliente
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME || 'creencia_sid'
};
