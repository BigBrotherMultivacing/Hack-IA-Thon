// Importa tipos y utilidades de Sequelize para definir el modelo
import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
// Importa la conexión a la base de datos
import { sequelize } from '../db/index.js';

// Clase que representa la tabla 'users' en la base de datos
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;  // Campo opcional al crear, autoincremental
  declare name: string;                   // Nombre del usuario
  declare email: string;                  // Correo único
  declare password_hash: string;          // Hash de la contraseña
}

// Inicialización del modelo y mapeo de columnas
User.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(120), allowNull: false },
  email: { type: DataTypes.STRING(160), allowNull: false, unique: true, validate: { isEmail: true } },
  password_hash: { type: DataTypes.STRING, allowNull: false }
}, { 
  sequelize,              // Conexión a usar
  modelName: 'User',      // Nombre interno del modelo
  tableName: 'users'      // Nombre de la tabla en la BD
});
