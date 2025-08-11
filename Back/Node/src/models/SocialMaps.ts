import { DataTypes, Model, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

export class SocialMaps extends Model<InferAttributes<SocialMaps>, InferCreationAttributes<SocialMaps>> {
  declare id: CreationOptional<number>;
  declare company_id: string;
  declare rating: number | null;             // 0..5
  declare reviews_count: number | null;
  declare trend30_json: object | null;       // JSON array
  declare samples_json: object | null;       // JSON array of {author,rating,text,ts}
  declare captured_at: Date | null;

  static initModel(sequelize: Sequelize) {
    SocialMaps.init({
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      company_id: { type: DataTypes.STRING(36), allowNull: false },
      rating: { type: DataTypes.DECIMAL(3,2), allowNull: true },
      reviews_count: { type: DataTypes.INTEGER, allowNull: true },
      trend30_json: { type: DataTypes.JSON, allowNull: true },
      samples_json: { type: DataTypes.JSON, allowNull: true },
      captured_at: { type: DataTypes.DATE, allowNull: true },
    }, {
      sequelize, tableName: 'social_maps', modelName: 'SocialMaps',
      indexes: [{ fields: ['company_id'] }, { fields: ['captured_at'] }]
    });
  }
}
