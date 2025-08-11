import { Router } from 'express';
import { sequelize } from '../db/index.js';

const r = Router();

function toRisk(score: number) {
  if (score >= 720) return 'Bajo';
  if (score >= 540) return 'Medio';
  return 'Alto';
}

r.get('/:id', async (req, res) => {
  const { id } = req.params;

  // 1) Meta empresa
  const [[company]]: any = await sequelize.query(
    'SELECT id, name, ruc, sector, became_large_year FROM companies WHERE id = ? LIMIT 1',
    { replacements: [id] }
  );
  if (!company) return res.status(404).json({ message: 'Empresa no encontrada' });

  // 2) Señales sociales
  const [[tw]]: any = await sequelize.query(
    `SELECT sentiment, volume_30d, trend30_json, top_terms_json
     FROM social_twitter WHERE company_id = ? ORDER BY captured_at DESC LIMIT 1`,
    { replacements: [id] }
  );
  const [[gm]]: any = await sequelize.query(
    `SELECT rating, reviews_count, trend30_json, samples_json
     FROM social_maps WHERE company_id = ? ORDER BY captured_at DESC LIMIT 1`,
    { replacements: [id] }
  );

  // 3) Trayectoria financiera (histórico anual)
  const [fy]: any = await sequelize.query(
    `SELECT year, revenue, ebitda_margin, cash_flow
     FROM financials_yearly WHERE company_id = ? ORDER BY year ASC`,
    { replacements: [id] }
  );

  // 4) Benchmarks sector
  const [[bench]]: any = await sequelize.query(
    `SELECT revenue_p50, revenue_p90, score_p50, score_p90
     FROM sector_benchmarks WHERE sector = ? LIMIT 1`,
    { replacements: [company.sector] }
  );

  // 5) Score + explicabilidad
  const [[model]]: any = await sequelize.query(
    `SELECT score, pd12, credit_limit FROM model_scores WHERE company_id = ? ORDER BY scored_at DESC LIMIT 1`,
    { replacements: [id] }
  );
  const [features]: any = await sequelize.query(
    `SELECT feature AS name, value, contribution
     FROM feature_importances WHERE company_id = ? ORDER BY ABS(contribution) DESC LIMIT 12`,
    { replacements: [id] }
  );

  // 6) Armar respuesta
  const data = {
    company,
    scoring: {
      score: Number(model?.score ?? 600),
      risk: toRisk(Number(model?.score ?? 600)) as 'Bajo'|'Medio'|'Alto',
      credit_limit: Number(model?.credit_limit ?? 15000),
      pd12: Number(model?.pd12 ?? 0.03)
    },
    social: {
      twitter: {
        sentiment: Number(tw?.sentiment ?? 70),
        volume_30d: Number(tw?.volume_30d ?? 12),
        trend30: tw?.trend30_json ? JSON.parse(tw.trend30_json) : Array.from({length:30},(_,i)=>50+Math.sin(i/5)*10),
        top_terms: tw?.top_terms_json ? JSON.parse(tw.top_terms_json) : ['pymes','servicio','entrega']
      },
      maps: {
        rating: Number(gm?.rating ?? 4.2),
        reviews_count: Number(gm?.reviews_count ?? 124),
        trend30: gm?.trend30_json ? JSON.parse(gm.trend30_json) : Array.from({length:30},(_,i)=>4+Math.cos(i/9)*.3),
        samples: gm?.samples_json ? JSON.parse(gm.samples_json) : [
          { author:'Ana', rating:5, text:'Excelente servicio', ts:new Date().toISOString() }
        ]
      },
      combined_sentiment: Math.round(
        (Number(tw?.sentiment ?? 70) * 0.6) + ((Number(gm?.rating ?? 4)*20) * 0.4)
      )
    },
    financials: {
      years: fy.map((r:any)=>r.year),
      revenue: fy.map((r:any)=>Number(r.revenue)),
      ebitda_margin: fy.map((r:any)=>Number(r.ebitda_margin)),
      cash_flow: fy.map((r:any)=>Number(r.cash_flow)),
      sector: company.sector,
      sector_benchmarks: {
        revenue_p50: Number(bench?.revenue_p50 ?? 200000),
        revenue_p90: Number(bench?.revenue_p90 ?? 1000000),
        score_p50: Number(bench?.score_p50 ?? 600),
        score_p90: Number(bench?.score_p90 ?? 780)
      }
    },
    explanation: { features: features.map((f:any)=>({ name:f.name, value:Number(f.value), contribution:Number(f.contribution) })) }
  };

  res.json(data);
});

r.post('/:id/simulate', async (req, res) => {
  // Simulador simple: mueve el score por ingresos, puntualidad y rating
  const { revenuePct=0, ontimePct=0, rating=0 } = req.body || {};
  const [[base]]: any = await sequelize.query(
    `SELECT score, credit_limit FROM model_scores WHERE company_id = ? ORDER BY scored_at DESC LIMIT 1`,
    { replacements: [req.params.id] }
  );
  let score = Number(base?.score ?? 600);
  score += revenuePct * 0.8;          // +0.8 por punto de ingreso
  score += ontimePct * 0.6;           // +0.6 por punto de puntualidad
  score += (rating - 4.0) * 10;       // +/-10 por cada punto de rating sobre/bajo 4.0
  score = Math.max(300, Math.min(900, Math.round(score)));

  const risk = score >= 720 ? 'Bajo' : score >= 540 ? 'Medio' : 'Alto';
  const credit_limit = Math.max(0, Math.round((base?.credit_limit ?? 15000) * (1 + (score - (base?.score ?? 600)) / 1200)));

  res.json({ score, risk, credit_limit });
});

export default r;
