import { Sequelize } from 'sequelize';
import { User } from './User.js';

export function initModels(sequelize: Sequelize) {
  User.initModel(sequelize);
}

export { User };