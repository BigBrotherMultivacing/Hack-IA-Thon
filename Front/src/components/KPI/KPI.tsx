import styles from './KPI.module.css';

type TrendDir = 'up'|'down'|'flat';
type State = 'good'|'warn'|'bad';

export default function KPI({
  title, value, subtitle, hint, progress, trend, state = 'good'
}: {
  title: string;
  value: string;
  subtitle?: string;
  hint?: string;
  progress?: number; // 0..100
  trend?: { dir: TrendDir; delta: string };
  state?: State;
}) {
  return (
    <div className={[styles.card, styles[state]].join(' ')} title={hint}>
      <div className={styles.title}>{title}</div>
      <div className={styles.value}>{value}</div>
      {subtitle ? <div className={styles.subtitle}>{subtitle}</div> : null}
      {typeof progress === 'number' ? (
        <div className={styles.bar}><div className={styles.fill} style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} /></div>
      ) : null}
      {trend ? <div className={styles.trend} data-dir={trend.dir}>{trend.delta}</div> : null}
    </div>
  );
}
