import { DataTypes, Model, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

export class ModelScore extends Model<InferAttributes<ModelScore>, InferCreationAttributes<ModelScore>> {
  declare id: CreationOptional<number>;
  declare company_id: string;
  declare score: number;
  declare pd12: number | null;           // 0..1
  declare credit_limit: number | null;   // USD
  declare scored_at: Date | null;

  static initModel(sequelize: Sequelize) {
    ModelScore.init({
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      company_id: { type: DataTypes.STRING(36), allowNull: false },
      score: { type: DataTypes.INTEGER, allowNull: false },
      pd12: { type: DataTypes.DECIMAL(6,5), allowNull: true },
      credit_limit: { type: DataTypes.BIGINT, allowNull: true },
      scored_at: { type: DataTypes.DATE, allowNull: true },
    }, {
      sequelize, tableName: 'model_scores', modelName: 'ModelScore',
      indexes: [{ fields: ['company_id'] }, { fields: ['scored_at'] }]
    });
  }
}
