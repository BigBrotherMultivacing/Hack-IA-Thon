import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './db/index.js';

(async () => {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`Creencia API escuchando en http://0.0.0.0:${env.PORT}`);
  });
})();
