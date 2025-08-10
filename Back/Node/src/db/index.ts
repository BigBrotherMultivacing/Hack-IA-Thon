// Importa Sequelize, el ORM que se usará para manejar la base de datos
import { Sequelize } from 'sequelize';

// Crea una instancia de Sequelize usando SQLite como motor de base de datos
export const sequelize = new Sequelize({
  dialect: 'sqlite',       // Tipo de base de datos: SQLite
  storage: './creencia.db',// Ruta del archivo físico de la base de datos
  logging: false           // Desactiva logs SQL en consola
});

// Función para conectar a la base y sincronizar modelos
export async function connectDB() {
  await sequelize.authenticate(); // Verifica la conexión con la base
  await sequelize.sync();          // Crea tablas según modelos (en producción se recomiendan migraciones)
}
