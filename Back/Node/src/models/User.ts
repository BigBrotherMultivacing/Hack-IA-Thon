import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../db/index.js';

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare email: string;
  declare password_hash: string;
}

User.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(120), allowNull: false },
  email: { type: DataTypes.STRING(160), allowNull: false, unique: true, validate: { isEmail: true } },
  password_hash: { type: DataTypes.STRING(255), allowNull: false }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
  indexes: [
    { unique: true, fields: ['email'] }
  ]
});
