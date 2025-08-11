import styles from './Gauge.module.css';

export default function Gauge({ value }: { value: number }){
  // value 0..100
  const v = Math.max(0, Math.min(100, value));
  const angle = (v/100) * 180 - 90; // semicircle
  const color = v < 40 ? '#17c964' : v < 70 ? '#ffdc50' : '#ff4d4f';
  return (
    <div className={styles.wrap}>
      <svg viewBox="0 0 100 60" className={styles.svg}>
        <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="8"/>
        <line x1="50" y1="50" x2={50 + 38*Math.cos(angle*Math.PI/180)} y2={50 + 38*Math.sin(angle*Math.PI/180)} stroke={color} strokeWidth="4" strokeLinecap="round" />
      </svg>
      <div className={styles.value}>{v}%</div>
    </div>
  );
}