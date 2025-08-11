import { DataTypes, Model, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

export class FeatureImportance extends Model<InferAttributes<FeatureImportance>, InferCreationAttributes<FeatureImportance>> {
  declare id: CreationOptional<number>;
  declare company_id: string;
  declare feature: string;
  declare value: number | null;
  declare contribution: number;     // puede ser negativo/positivo

  static initModel(sequelize: Sequelize) {
    FeatureImportance.init({
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      company_id: { type: DataTypes.STRING(36), allowNull: false },
      feature: { type: DataTypes.STRING(120), allowNull: false },
      value: { type: DataTypes.DOUBLE, allowNull: true },
      contribution: { type: DataTypes.DOUBLE, allowNull: false },
    }, {
      sequelize, tableName: 'feature_importances', modelName: 'FeatureImportance',
      indexes: [{ fields: ['company_id'] }, { fields: ['feature'] }]
    });
  }
}
