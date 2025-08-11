import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Shell from '../../layout/Shell';
import KPI from '../../components/KPI/KPI';
import Sparkline from '../../components/Sparkline/Sparkline';
import Gauge from '../../components/Gauge/Gauge';
import FeatureBar from '../../components/FeatureBar/FeatureBar';
import ReviewCard from '../../components/Review/ReviewCard';
import { getDashboardByApplication, simulate, type DashboardData } from '../../utils/api';
import styles from './Dashboard.module.css';

export default function Dashboard(){
  const { user } = useAuth();
  const { appId } = useParams();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [sim, setSim] = useState<{ revenuePct: number; ontimePct: number; rating: number }>({ revenuePct: 0, ontimePct: 0, rating: 0 });
  const [simOut, setSimOut] = useState<{ score?: number; risk?: 'Bajo'|'Medio'|'Alto'; credit_limit?: number }>({});

  useEffect(() => { if (!appId) return; setLoading(true); (async () => { try { setData(await getDashboardByApplication(appId)); } finally { setLoading(false); } })(); }, [appId]);

  const riskPct = useMemo(() => {
    if (!data) return 0; return data.scoring.risk === 'Bajo' ? 25 : data.scoring.risk === 'Medio' ? 55 : 85;
  }, [data]);

  async function onSimChange(next: Partial<typeof sim>){
    const merged = { ...sim, ...next }; setSim(merged); if (!appId) return;
    try { const out = await simulate(appId, merged); setSimOut(out); } catch {}
  }

  return (
    <Shell title="Panel" subtitle={<>Bienvenido, <strong>{user?.name ?? 'Usuario'}</strong></>}>
      {(!data && !loading) ? <div className={styles.placeholder}>Procesando solicitud…</div> : null}
      {data ? (
        <div className={styles.grid}>
          {/* KPIs */}
          <section className={styles.kpis}>
            <KPI title="Score alternativo" value={`${data.scoring.score}`} subtitle={`${data.scoring.risk}`} progress={Math.round((data.scoring.score/900)*100)} trend={{ dir: 'up', delta: `${Math.random()>0.5?'+':'-'}2 pts` }} />
            <KPI title="Prob. impago 12m" value={`${(data.scoring.pd12*100).toFixed(1)}%`} subtitle="Estimado" progress={Math.max(0, Math.min(100, 100 - data.scoring.pd12*100))} trend={{ dir: 'down', delta: '−0.2 pp' }} />
            <KPI title="Límite recomendado" value={`$${data.scoring.credit_limit.toLocaleString()}`} subtitle="USD" />
          </section>

          {/* Riesgo + Salud digital */}
          <section className={styles.gaugeRow}>
            <div className={styles.card}>
              <h3>Semáforo de riesgo</h3>
              <Gauge value={riskPct} />
              <div className={styles.hint}>Clasificación: {data.scoring.risk}</div>
            </div>
            <div className={styles.card}>
              <h3>Salud digital</h3>
              <div className={styles.big}>{Math.round(data.social.combined_sentiment)}/100</div>
              <div className={styles.hint}>Twitter + Google Maps</div>
              <Sparkline data={data.social.twitter.trend30} />
            </div>
          </section>

          {/* Señales sociales */}
          <section className={styles.social}>
            <div className={styles.card}>
              <h3>Twitter</h3>
              <div className={styles.row}><span>Sentimiento</span><b>{Math.round(data.social.twitter.sentiment)} / 100</b></div>
              <div className={styles.row}><span>Volumen 30d</span><b>{data.social.twitter.volume_30d}</b></div>
              <div className={styles.row}><span>Tendencia</span><Sparkline data={data.social.twitter.trend30} /></div>
              <div className={styles.terms}>{data.social.twitter.top_terms.map(t => <span key={t} className={styles.term}>#{t}</span>)}</div>
            </div>
            <div className={styles.card}>
              <h3>Google Maps</h3>
              <div className={styles.row}><span>Rating</span><b>{data.social.maps.rating.toFixed(1)} ★</b></div>
              <div className={styles.row}><span>Reseñas</span><b>{data.social.maps.reviews_count}</b></div>
              <div className={styles.row}><span>Tendencia</span><Sparkline data={data.social.maps.trend30} /></div>
              <div className={styles.reviews}>{data.social.maps.samples.slice(0,3).map((r,i) => <ReviewCard key={i} {...r} />)}</div>
            </div>
          </section>

          {/* Financieros */}
          <section className={styles.financials}>
            <div className={styles.card}>
              <h3>Ingresos</h3>
              <Sparkline data={data.financials.revenue} />
              <div className={styles.hint}>Años: {data.financials.years[0]}–{data.financials.years[data.financials.years.length-1]}</div>
            </div>
            <div className={styles.card}>
              <h3>EBITDA%</h3>
              <Sparkline data={data.financials.ebitda_margin.map(v => Math.round(v*100))} />
            </div>
            <div className={styles.card}>
              <h3>Flujo de caja</h3>
              <Sparkline data={data.financials.cash_flow} />
            </div>
            <div className={styles.card}>
              <h3>Comparativo sector</h3>
              <div className={styles.rowsm}><span>P50 ingresos</span><b>${data.financials.sector_benchmarks.revenue_p50.toLocaleString()}</b></div>
              <div className={styles.rowsm}><span>P90 ingresos</span><b>${data.financials.sector_benchmarks.revenue_p90.toLocaleString()}</b></div>
              <div className={styles.rowsm}><span>P50 score</span><b>{data.financials.sector_benchmarks.score_p50}</b></div>
              <div className={styles.rowsm}><span>P90 score</span><b>{data.financials.sector_benchmarks.score_p90}</b></div>
            </div>
          </section>

          {/* Explicación + simulador */}
          <section className={styles.explain}>
            <div className={styles.card}>
              <h3>¿Por qué este score?</h3>
              <div className={styles.featureList}>
                {data.explanation.features.slice(0,6).map(f => (
                  <FeatureBar key={f.name} name={f.name} contribution={f.contribution} />
                ))}
              </div>
            </div>
            <div className={styles.card}>
              <h3>Simular escenarios</h3>
              <label className={styles.sliderLabel}>Ingresos: {sim.revenuePct}%</label>
              <input type="range" min="-20" max="40" value={sim.revenuePct} onChange={e => onSimChange({ revenuePct: Number(e.target.value) })} />
              <label className={styles.sliderLabel}>Entregas/Pagos a tiempo: {sim.ontimePct}%</label>
              <input type="range" min="0" max="30" value={sim.ontimePct} onChange={e => onSimChange({ ontimePct: Number(e.target.value) })} />
              <label className={styles.sliderLabel}>Rating Maps: {sim.rating || 0}</label>
              <input type="range" min="0" max="5" step="0.1" value={sim.rating} onChange={e => onSimChange({ rating: Number(e.target.value) })} />
              <div className={styles.simOut}>
                <div><span>Nuevo score</span><b>{simOut.score ?? data.scoring.score}</b></div>
                <div><span>Riesgo</span><b>{simOut.risk ?? data.scoring.risk}</b></div>
                <div><span>Límite crédito</span><b>{simOut.credit_limit ? `$${simOut.credit_limit.toLocaleString()}` : `$${data.scoring.credit_limit.toLocaleString()}`}</b></div>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </Shell>
  );
}