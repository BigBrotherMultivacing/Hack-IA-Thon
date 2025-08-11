import { DataTypes, Model, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

export class Company extends Model<InferAttributes<Company>, InferCreationAttributes<Company>> {
  declare id: string;                   // UUID o VARCHAR(36)
  declare name: string;
  declare ruc: string | null;
  declare sector: string | null;
  declare became_large_year: number | null;

  static initModel(sequelize: Sequelize) {
    Company.init({
      id: { type: DataTypes.STRING(36), primaryKey: true },
      name: { type: DataTypes.STRING(200), allowNull: false },
      ruc: { type: DataTypes.STRING(20), allowNull: true },
      sector: { type: DataTypes.STRING(120), allowNull: true },
      became_large_year: { type: DataTypes.INTEGER, allowNull: true },
    }, {
      sequelize, tableName: 'companies', modelName: 'Company',
      charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci',
      indexes: [{ fields: ['sector'] }]
    });
  }
}
