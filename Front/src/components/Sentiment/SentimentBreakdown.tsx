import styles from './SentimentBreakdown.module.css';
import type { MapsTwitterData } from '../../utils/api';

export default function SentimentBreakdown({ data, hideScore = false }: { data: MapsTwitterData; hideScore?: boolean }) {
  const neg = data.negativo?.count ?? 0;
  const pos = data.positivo?.count ?? 0;
  const neu = data.neutral ?? 0;
  const total = Math.max(1, neg + pos + neu);
  const pct = (n: number) => Math.round((n/total)*100);

  const negKeys = Object.keys(data.negativo || {}).filter(k => k !== 'count');
  const posKeys = Object.keys(data.positivo || {}).filter(k => k !== 'count');

  return (
    <div className={styles.grid}>
      <div className={[styles.card, styles.neg].join(' ')}>
        <div className={styles.title}>Negativo</div>
        <div className={styles.big}>{pct(neg)}%</div>
        <ul className={styles.list}>
          {negKeys.slice(0,6).map(k => <li key={k}><span>{k}</span><b>{(data.negativo as any)[k]}</b></li>)}
        </ul>
      </div>

      <div className={[styles.card, styles.pos].join(' ')}>
        <div className={styles.title}>Positivo</div>
        <div className={styles.big}>{pct(pos)}%</div>
        <ul className={styles.list}>
          {posKeys.slice(0,6).map(k => <li key={k}><span>{k}</span><b>{(data.positivo as any)[k]}</b></li>)}
        </ul>
      </div>

      <div className={styles.card}>
        <div className={styles.splitRow}>
          <div>
            <div className={styles.title}>Neutral</div>
            <div className={styles.big}>{pct(neu)}%</div>
          </div>
          {!hideScore ? (
            <div className={styles.scoreBox}>
              <span>Score</span>
              <b>{data.score}</b>
            </div>
          ) : null}
        </div>
        <div className={styles.feedback}>
          <span>Feedback</span>
          <p>{data.retroalimentacion || '—'}</p>
        </div>
      </div>
    </div>
  );
}
