// Importa la librería 'cors' para habilitar y configurar CORS en Express
import cors from 'cors';
// Importa las variables de entorno procesadas desde el archivo env.ts
import { env } from './env.js';

// Exporta un middleware de CORS ya configurado
export const corsMiddleware = cors({
  // Define el origen permitido para las solicitudes (URL del frontend)
  origin: env.CORS_ORIGIN,
  // Permite enviar cookies y cabeceras de autenticación en las solicitudes
  credentials: true,
  // Métodos HTTP permitidos
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  // Cabeceras que el servidor acepta desde el cliente
  allowedHeaders: ['Content-Type', 'Authorization']
});
