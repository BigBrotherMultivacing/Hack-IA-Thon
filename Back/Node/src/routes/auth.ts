import { Router } from 'express';
import { User } from '../models/User.js';
import bcrypt from 'bcrypt';
import { signToken, requireAuth } from '../middlewares/auth.js';
import { env } from '../config/env.js';

const router = Router();

// registro opcional para pruebas
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ message: 'Faltan campos' });

  const exists = await User.findOne({ where: { email } });
  if (exists) return res.status(409).json({ message: 'Correo ya registrado' });

  const password_hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password_hash });
  res.status(201).json({ id: user.id, name: user.name, email: user.email });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Correo y contraseña requeridos' });

  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' });

  const payload = { id: user.id, email: user.email, name: user.name };
  const token = signToken(payload);

  // cookie httpOnly + retorno en body para tu frontend
  res.cookie(env.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // en prod: true con HTTPS
    maxAge: 24 * 60 * 60 * 1000
  });

  return res.json({ token, user: payload });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = (req as any).user;
  res.json({ user });
});

router.post('/logout', (req, res) => {
  res.clearCookie(env.SESSION_COOKIE_NAME);
  res.json({ success: true });
});

export default router;
