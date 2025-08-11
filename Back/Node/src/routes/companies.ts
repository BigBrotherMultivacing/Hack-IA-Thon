import { Router } from 'express';
import { sequelize } from '../db/index.js';

const r = Router();

r.get('/', async (_req, res) => {
  const [rows] = await sequelize.query(`
    SELECT id, name, ruc, sector, became_large_year
    FROM companies
    ORDER BY name LIMIT 200
  `);
  res.json(rows);
});

export default r;
