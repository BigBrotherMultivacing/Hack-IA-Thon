import { Router } from 'express';
import { User } from '../models/User.js';
import bcrypt from 'bcrypt';
import { signToken, requireAuth } from '../middlewares/auth.js';
import { env } from '../config/env.js';

const router = Router();

// Ruta para registrar un usuario nuevo (solo para pruebas)
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body || {};

  // Validar que los campos requeridos estén presentes
  if (!name || !email || !password) return res.status(400).json({ message: 'Faltan campos' });

  // Verificar si ya existe un usuario con el mismo correo
  const exists = await User.findOne({ where: { email } });
  if (exists) return res.status(409).json({ message: 'Correo ya registrado' });

  // Generar hash de la contraseña
  const password_hash = await bcrypt.hash(password, 10);

  // Crear usuario en la base
  const user = await User.create({ name, email, password_hash });

  // Responder con datos del nuevo usuario (sin contraseña)
  res.status(201).json({ id: user.id, name: user.name, email: user.email });
});

// Ruta para iniciar sesión
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  // Validar campos
  if (!email || !password) return res.status(400).json({ message: 'Correo y contraseña requeridos' });

  // Buscar usuario por email
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

  // Verificar contraseña
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' });

  // Preparar payload para JWT
  const payload = { id: user.id, email: user.email, name: user.name };
  const token = signToken(payload);

  // Configurar cookie httpOnly y devolver también el token en JSON
  res.cookie(env.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // Cambiar a true en producción con HTTPS
    maxAge: 24 * 60 * 60 * 1000
  });

  return res.json({ token, user: payload });
});

// Ruta para obtener información del usuario autenticado
router.get('/me', requireAuth, async (req, res) => {
  const user = (req as any).user;
  res.json({ user });
});

// Ruta para cerrar sesión
router.post('/logout', (req, res) => {
  res.clearCookie(env.SESSION_COOKIE_NAME);
  res.json({ success: true });
});

export default router;
