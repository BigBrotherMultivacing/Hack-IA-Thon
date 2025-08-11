import { DataTypes, Model, Sequelize, InferAttributes, InferCreationAttributes } from 'sequelize';

export class SectorBenchmark extends Model<InferAttributes<SectorBenchmark>, InferCreationAttributes<SectorBenchmark>> {
  declare sector: string;     // PK
  declare revenue_p50: number | null;
  declare revenue_p90: number | null;
  declare score_p50: number | null;
  declare score_p90: number | null;

  static initModel(sequelize: Sequelize) {
    SectorBenchmark.init({
      sector: { type: DataTypes.STRING(120), primaryKey: true },
      revenue_p50: { type: DataTypes.BIGINT, allowNull: true },
      revenue_p90: { type: DataTypes.BIGINT, allowNull: true },
      score_p50: { type: DataTypes.INTEGER, allowNull: true },
      score_p90: { type: DataTypes.INTEGER, allowNull: true },
    }, {
      sequelize, tableName: 'sector_benchmarks', modelName: 'SectorBenchmark',
    });
  }
}
