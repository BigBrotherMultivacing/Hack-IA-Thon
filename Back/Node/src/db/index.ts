import { Sequelize } from 'sequelize';
import { env } from '../config/env.js';
import { initModels } from '../models/index.js';

export const sequelize = new Sequelize(env.DB.NAME, env.DB.USER, env.DB.PASSWORD, {
  host: env.DB.HOST,
  port: env.DB.PORT,
  dialect: env.DB.DIALECT,
  logging: false,
  timezone: '-05:00', // ajusta si quieres UTC-5: '-05:00'
  dialectOptions: {
    // Para algunos RDS con SSL obligatorio. Si tienes CA, pásala aquí.
    ssl: env.DB.SSL ? { require: true, rejectUnauthorized: false } : undefined
  },
  pool: { max: 10, min: 0, idle: 10000, acquire: 30000 }
});

export async function connectDB() {
  await sequelize.authenticate();
  initModels(sequelize);
  await sequelize.sync();
}
