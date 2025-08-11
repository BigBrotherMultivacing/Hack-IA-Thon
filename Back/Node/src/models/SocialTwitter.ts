import { DataTypes, Model, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

export class SocialTwitter extends Model<InferAttributes<SocialTwitter>, InferCreationAttributes<SocialTwitter>> {
  declare id: CreationOptional<number>;
  declare company_id: string;
  declare sentiment: number | null;        // 0..100
  declare volume_30d: number | null;
  declare trend30_json: object | null;     // JSON array
  declare top_terms_json: object | null;   // JSON array
  declare captured_at: Date | null;

  static initModel(sequelize: Sequelize) {
    SocialTwitter.init({
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      company_id: { type: DataTypes.STRING(36), allowNull: false },
      sentiment: { type: DataTypes.DECIMAL(5,2), allowNull: true },
      volume_30d: { type: DataTypes.INTEGER, allowNull: true },
      trend30_json: { type: DataTypes.JSON, allowNull: true },
      top_terms_json: { type: DataTypes.JSON, allowNull: true },
      captured_at: { type: DataTypes.DATE, allowNull: true },
    }, {
      sequelize, tableName: 'social_twitter', modelName: 'SocialTwitter',
      indexes: [{ fields: ['company_id'] }, { fields: ['captured_at'] }]
    });
  }
}
