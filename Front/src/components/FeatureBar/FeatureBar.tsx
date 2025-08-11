import styles from './FeatureBar.module.css';

export default function FeatureBar({ name, contribution }: { name: string; contribution: number }){
  const pct = Math.min(100, Math.max(0, Math.round(Math.abs(contribution)*100)));
  const dir = contribution >= 0 ? 'pos' : 'neg';
  return (
    <div className={styles.row} data-dir={dir}>
      <span className={styles.name}>{name}</span>
      <div className={styles.bar}><div style={{ width: `${pct}%` }} /></div>
      <span className={styles.pct}>{contribution >= 0 ? '+' : '−'}{pct}%</span>
    </div>
  );
}