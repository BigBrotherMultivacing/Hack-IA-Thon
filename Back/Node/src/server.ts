// Importa la app configurada y utilidades necesarias
import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './db/index.js';

// Función autoejecutable para arrancar el servidor
(async () => {
  // Conecta a la base de datos y sincroniza modelos
  await connectDB();

  // Arranca el servidor en el puerto definido en variables de entorno
  app.listen(env.PORT, () => {
    console.log(`Creencia API escuchando en http://0.0.0.0:${env.PORT}`);
  });
})();
