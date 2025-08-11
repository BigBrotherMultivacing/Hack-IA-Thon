// Importa dependencias principales
import express from 'express';              // Framework web para crear API
import helmet from 'helmet';                // Middleware de seguridad HTTP
import rateLimit from 'express-rate-limit'; // Middleware para limitar peticiones
import cookieParser from 'cookie-parser';   // Middleware para leer cookies
import { corsMiddleware } from './config/cors.js'; // Configuración CORS personalizada
import authRoutes from './routes/auth.js';
import companies from './routes/companies.js';
import dashboard from './routes/dashboard.js';

// Crea la instancia de la aplicación Express
const app = express();

// Seguridad: añade cabeceras HTTP seguras
app.use(helmet());

// Middleware para parsear JSON en las peticiones
app.use(express.json());

// Middleware para leer cookies de las peticiones
app.use(cookieParser());

// Configuración CORS para permitir dominios específicos
app.use(corsMiddleware);

// Monta las rutas de autenticación bajo el prefijo /api/auth
// Aplica un limitador de 200 peticiones cada 15 minutos por IP
app.use('/api/auth', rateLimit({ windowMs: 15*60*1000, max: 1000 }), authRoutes);
app.use('/api/companies', companies);
app.use('/api/dashboard', dashboard);

// Ruta simple para comprobar que el servidor está vivo
app.get('/health', (_req, res) => res.json({ ok: true }));

// Exporta la app para usarla en el arranque del servidor
export default app;
