import { DataTypes, Model, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare email: string;
  declare password_hash: string;

  static initModel(sequelize: Sequelize) {
    User.init({
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(120), allowNull: false },
      email: { type: DataTypes.STRING(160), allowNull: false, unique: true, validate: { isEmail: true } },
      password_hash: { type: DataTypes.STRING(255), allowNull: false }
    }, {
      sequelize,
      tableName: 'users',
      modelName: 'User',
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      indexes: [{ unique: true, fields: ['email'] }]
    });
  }
}
