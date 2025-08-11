import styles from './Sparkline.module.css';

export default function Sparkline({ data, width=180, height=36, strokeWidth=2 }: { data: number[]; width?: number; height?: number; strokeWidth?: number }){
  if (!data || data.length === 0) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const norm = (v: number) => max === min ? 0.5 : (v - min) / (max - min);
  const points = data.map((v,i) => {
    const x = (i/(data.length-1)) * (width-2) + 1;
    const y = (1 - norm(v)) * (height-2) + 1;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg className={styles.svg} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline className={styles.line} fill="none" strokeWidth={strokeWidth} points={points} />
    </svg>
  );
}