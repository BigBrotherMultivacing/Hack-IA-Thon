import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { corsMiddleware } from './config/cors.js';
import authRoutes from './routes/auth.js';

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(corsMiddleware);

app.use('/api/auth', rateLimit({ windowMs: 15*60*1000, max: 200 }), authRoutes);

app.get('/health', (_req, res) => res.json({ ok: true }));

export default app;
