import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Shell from '../../layout/Shell';
import Donut from '../../components/Donut/Donut';
import SentimentBreakdown from '../../components/Sentiment/SentimentBreakdown';
import Scale from '../../components/Scale/Scale';
import styles from './Dashboard.module.css';
import { getDashboardByApplication, type DashboardDataV2 } from '../../utils/api';

// ---------- MOCK PARA DEMO ----------
function getMock(): DashboardDataV2 {
  return {
    instagram: { score: 5, engagement: 0.32 },
    mapsTwitter: {
      negativo: {
        count: 12,
        'Reproche / llamado de atención': 3,
        'Queja de calidad': 4,
        'Problema de atención': 2,
        'Incumplimiento / retraso': 2,
        'Problema de precio': 1,
        'Fraude / engaño': 0,
        General: 0
      },
      positivo: {
        count: 28,
        'Recomendación directa': 10,
        'Reconocimiento de calidad': 8,
        'Atención destacada': 4,
        'Rapidez / cumplimiento': 3,
        'Relación calidad-precio': 3,
        General: 0
      },
      neutral: 7,
      retroalimentacion: 'Clientes piden ampliar horarios',
      score: 78
    },
    patrimonio: { count: 120000, score: 3.4 },
    balance: 90000,
    flujo: { ingresos: 56000, egresos: 41000, score: 72 },
    score_total: 79
  };
}
// ------------------------------------

export default function Dashboard(){
  const { user } = useAuth();
  const { appId } = useParams();
  const [data, setData] = useState<DashboardDataV2 | null>(null);
  const [loading, setLoading] = useState(false);
  const [factor, setFactor] = useState(1);

  useEffect(() => {
    if (!appId) return;
    // DEMO
    if (appId === 'demo') { setData(getMock()); return; }
    // Real
    setLoading(true);
    (async () => { try { setData(await getDashboardByApplication(appId)); } finally { setLoading(false); } })();
  }, [appId]);

  const patrimonioSim = useMemo(() => {
    if (!data) return { value: 0, score: 0 };
    const base = data.patrimonio;
    const scorePrime = Math.max(1, Math.min(5, +(base.score * Math.pow(factor, 0.85)).toFixed(2)));
    const valuePrime = Math.round(base.count * factor);
    return { value: valuePrime, score: scorePrime };
  }, [data, factor]);

  const creditScore = useMemo(() => {
    if (!data) return 0;
    if (typeof data.score_total === 'number') return data.score_total;
    const sInst = data.instagram.score;
    const sSoc  = data.mapsTwitter.score;
    const sPat  = data.patrimonio.score * 20;
    const sFlu  = data.flujo.score;
    return Math.round(0.25*sInst + 0.35*sSoc + 0.25*sPat + 0.15*sFlu);
  }, [data]);

  return (
    <Shell title="Panel" subtitle={<>Bienvenido, <strong>{user?.name ?? 'Usuario'}</strong></>}>
      {(!data && !loading) ? <div className={styles.placeholder}>Procesando solicitud…</div> : null}
      {data ? (
        <div className={styles.grid}>
          {/* Instagram */}

        {/* Instagram */}
        <section className={styles.row3}>
          <div className={styles.card}>
            <h3>Instagram</h3>
            <div className={styles.subTitle}>Analítica de engagement</div>
            <div className={styles.igBlockCol}>
              <Donut value={data.instagram.engagement} label="Engagement" />
              <div className={styles.igMetaUnder}>
                <div className={styles.kv}><span>Engagement</span><b>{Math.round(data.instagram.engagement*100)}%</b></div>
                <div className={styles.kv}><span>Total score IG</span><b>{data.instagram.score}</b></div>
              </div>
            </div>
          </div>

          {/* Twitter + Maps */}
          <div className={styles.card} style={{ gridColumn: 'span 2' }}>
            <div className={styles.cardHeaderRow}>
              <h3>Twitter + Google Maps</h3>
              <div className={styles.headerScoreRight}>

              </div>
            </div>

            <div className={styles.subTitle}>Sentimientos y feedback</div>
                <h3>Total score {data.mapsTwitter.score}</h3>
            <SentimentBreakdown data={data.mapsTwitter} hideScore />
          </div>

        </section>

        {/* Patrimonio (un solo cuadro) */}
{/* Patrimonio (un solo cuadro) */}
<section className={styles.row1}>
  <div className={styles.card}>
    <h3>Patrimonio</h3>
    <div className={styles.subTitle}>Valor total, score y simulación</div>

    <div className={styles.kv}>
      <span>Patrimonio</span>
      <b>${data.patrimonio.count.toLocaleString()}</b>
    </div>

    {/* Selector de multiplicador 1..5 en pasos de 0.5 */}
    <div className={styles.chips}>
      {[1,1.5,2,2.5,3,3.5,4,4.5,5].map(v => (
        <button
          key={v}
          type="button"
          className={[styles.chip, factor===v ? styles.chipActive : ''].join(' ')}
          onClick={() => setFactor(v)}
        >
          {v}×
        </button>
      ))}
    </div>

    {/* Recta 1–5 = multiplicador. Actual en 1×, sim en factor */}
    <Scale
      interactive
      min={1}
      max={5}
      step={0.5}
      markers={[
        { value: 1,      label: 'Actual 1×',                      kind: 'actual' as const },
        { value: factor, label: `Simulado ${factor.toFixed(1)}×`, kind: 'sim'    as const }
      ]}
      onPick={(pickedFactor) => {
        // ahora el valor PICK es el multiplicador directo
        setFactor(pickedFactor);
      }}
    />

    <div className={styles.kv}>
      <span>Patrimonio simulado</span>
      <b>${patrimonioSim.value.toLocaleString()}</b>
    </div>
    <div className={styles.kv}>
      <span>Nuevo score</span>
      <b>{patrimonioSim.score} / 5</b>
    </div>
  </div>
</section>

        {/* Ingresos + Egresos + Score (un solo cuadro) */}
        <section className={styles.row1}>
          <div className={styles.card}>
            <h3>Ingresos y egresos</h3>
            <div className={styles.subTitle}>Último período</div>
            <div className={styles.ieGrid}>
              <div className={styles.kv}><span>Ingresos</span><b>${data.flujo.ingresos.toLocaleString()}</b></div>
              <div className={styles.kv}><span>Egresos</span><b>${data.flujo.egresos.toLocaleString()}</b></div>
              <div className={styles.scoreRight}>
              </div>
                </div>
                <div className={styles.scoreRight}>
                  <span className={styles.scoreLabel}>Score de flujo</span>
                  <b className={styles.huge}>{data.flujo.score}</b>
            </div>
          </div>
        </section>

        <section className={styles.row1}>
          <div className={styles.cardCenter}>
            <h3>Score crediticio total</h3>
            <div className={styles.massive}>{creditScore}</div>
          </div>
        </section>

        </div>
      ) : null}
    </Shell>
  );
}
