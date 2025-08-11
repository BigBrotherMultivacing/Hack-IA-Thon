import React, { useRef } from 'react';
import styles from './Scale.module.css';

type Marker = { value: number; label?: string; kind?: 'actual' | 'sim' };

export default function Scale({
  min = 1,
  max = 5,
  step = 0.5,
  markers,
  interactive = false,
  onPick
}: {
  min?: number;
  max?: number;
  step?: number;
  markers: Marker[];
  interactive?: boolean;
  onPick?: (value: number) => void;   // value en la escala 1..5
}) {
  const wrapRef = useRef<HTMLDivElement>(null);

  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  const snap = (v: number) => {
    const n = Math.round((v - min) / step) * step + min;
    return +n.toFixed(2);
  };
  const pos = (v: number) => ((clamp(v) - min) / (max - min)) * 100;

  function valueFromClientX(clientX: number) {
    const el = wrapRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    const raw = min + ratio * (max - min);
    return snap(clamp(raw));
  }

  function startPointer(e: React.PointerEvent) {
    if (!interactive || !onPick) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const v = valueFromClientX(e.clientX);
    if (v != null) onPick(v);
  }

  function movePointer(e: React.PointerEvent) {
    if (!interactive || !onPick) return;
    if ((e.buttons & 1) !== 1) return; // solo mientras está presionado
    const v = valueFromClientX(e.clientX);
    if (v != null) onPick(v);
  }

  return (
    <div
      ref={wrapRef}
      className={[styles.wrap, interactive ? styles.interactive : ''].join(' ')}
      onPointerDown={startPointer}
      onPointerMove={movePointer}
      role={interactive ? 'slider' : undefined}
      aria-valuemin={interactive ? min : undefined}
      aria-valuemax={interactive ? max : undefined}
    >
      <div className={styles.line} />
      <div className={styles.ticks}>
        {Array.from({ length: Math.round((max - min) / step) + 1 }).map((_, i) => {
          const v = +(min + i * step).toFixed(2);
          return (
            <div key={v} className={styles.tick} style={{ left: `${pos(v)}%` }}>
              {v % 1 === 0 ? <span className={styles.tickLabel}>{v}</span> : null}
            </div>
          );
        })}
      </div>

      {markers.map((m, i) => (
        <div
          key={`${m.kind ?? 'm'}-${i}`}
          className={[styles.marker, m.kind ? styles[m.kind] : ''].join(' ')}
          style={{ left: `${pos(m.value)}%` }}
        >
          <div className={styles.dot} />
          {m.label ? <div className={styles.markerLabel}>{m.label}</div> : null}
        </div>
      ))}
    </div>
  );
}
