import React from 'react';
import styles from './Donut.module.css';

export default function Donut({
  value, // 0..1
  label = 'Engagement',
  center
}: { value: number; label?: string; center?: React.ReactNode }) {
  const pct = Math.max(0, Math.min(1, value));
  const size = 140, stroke = 14, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const dash = c * pct, gap = c - dash;
  return (
    <div className={styles.wrap}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={styles.svg} role="img" aria-label={`${label} ${Math.round(pct*100)}%`}>
        <circle cx={size/2} cy={size/2} r={r} className={styles.bg} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} className={styles.fg} strokeWidth={stroke}
          strokeDasharray={`${dash} ${gap}`} transform={`rotate(-90 ${size/2} ${size/2})`} />
      </svg>
      <div className={styles.center}>
        <div className={styles.value}>{Math.round(pct*100)}%</div>
        <div className={styles.label}>{label}</div>
        {center}
      </div>
    </div>
  );
}
