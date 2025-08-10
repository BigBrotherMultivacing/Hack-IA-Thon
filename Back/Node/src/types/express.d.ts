// Extiende los tipos de Express para incluir la propiedad 'user' en la request
import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    // Objeto con la información del usuario autenticado
    user?: { id: number; email: string; name: string };
  }
}
