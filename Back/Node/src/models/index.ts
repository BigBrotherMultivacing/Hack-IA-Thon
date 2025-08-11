import { Sequelize } from 'sequelize';
import { User } from './User.js';
import { Company } from './Company.js';
import { SocialTwitter } from './SocialTwitter.js';
import { SocialMaps } from './SocialMaps.js';
import { FinancialYear } from './FinancialYear.js';
import { SectorBenchmark } from './SectorBenchmark.js';
import { ModelScore } from './ModelScore.js';
import { FeatureImportance } from './FeatureImportance.js';

export function initModels(sequelize: Sequelize) {
  User.initModel(sequelize);
  Company.initModel(sequelize);
  SocialTwitter.initModel(sequelize);
  SocialMaps.initModel(sequelize);
  FinancialYear.initModel(sequelize);
  SectorBenchmark.initModel(sequelize);
  ModelScore.initModel(sequelize);
  FeatureImportance.initModel(sequelize);

  // Associations
  Company.hasMany(SocialTwitter, { foreignKey: 'company_id', as: 'tw' });
  Company.hasMany(SocialMaps,   { foreignKey: 'company_id', as: 'gm' });
  Company.hasMany(FinancialYear,{ foreignKey: 'company_id', as: 'financials' });
  Company.hasMany(ModelScore,   { foreignKey: 'company_id', as: 'scores' });
  Company.hasMany(FeatureImportance,{ foreignKey: 'company_id', as: 'features' });

  SocialTwitter.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
  SocialMaps.belongsTo(Company,    { foreignKey: 'company_id', as: 'company' });
  FinancialYear.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
  ModelScore.belongsTo(Company,    { foreignKey: 'company_id', as: 'company' });
  FeatureImportance.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
}

export { User, Company, SocialTwitter, SocialMaps, FinancialYear, SectorBenchmark, ModelScore, FeatureImportance };