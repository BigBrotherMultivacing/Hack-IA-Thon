import { DataTypes, Model, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

export class FinancialYear extends Model<InferAttributes<FinancialYear>, InferCreationAttributes<FinancialYear>> {
  declare id: CreationOptional<number>;
  declare company_id: string;
  declare year: number;
  declare revenue: number | null;        // USD
  declare ebitda_margin: number | null;  // 0..1
  declare cash_flow: number | null;      // USD

  static initModel(sequelize: Sequelize) {
    FinancialYear.init({
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      company_id: { type: DataTypes.STRING(36), allowNull: false },
      year: { type: DataTypes.INTEGER, allowNull: false },
      revenue: { type: DataTypes.BIGINT, allowNull: true },
      ebitda_margin: { type: DataTypes.DECIMAL(5,4), allowNull: true },
      cash_flow: { type: DataTypes.BIGINT, allowNull: true },
    }, {
      sequelize, tableName: 'financials_yearly', modelName: 'FinancialYear',
      indexes: [{ fields: ['company_id'] }, { fields: ['year'] }]
    });
  }
}
