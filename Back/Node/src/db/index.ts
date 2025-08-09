import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './creencia.db',
  logging: false
});

export async function connectDB() {
  await sequelize.authenticate();
  await sequelize.sync(); // en prod usa migraciones
}
