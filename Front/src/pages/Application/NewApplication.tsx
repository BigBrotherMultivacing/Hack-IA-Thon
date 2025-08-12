import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Shell from '../../layout/Shell';
import TextField from '../../components/TextField/TextField';
import Button from '../../components/Button/Button';
import styles from './NewApplication.module.css';

// ===== util local =====
const PY_API = (import.meta as any).env?.VITE_PY_API_URL || 'http://localhost:8000';

function sanitizeHandle(v?: string){
  return (v || '').trim().replace(/^@+/, '');
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error('No se pudo leer el archivo'));
    r.onload = () => {
      const s = String(r.result || '');
      const ix = s.indexOf('base64,');
      resolve(ix >= 0 ? s.slice(ix + 7) : s);
    };
    r.readAsDataURL(file);
  });
}

export default function NewApplication(){
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Estado del proceso Python
  const [ticket, setTicket] = useState<string | null>(null);
  const [procStatus, setProcStatus] = useState<'idle'|'processing'|'done'|'error'>('idle');
  const [result, setResult] = useState<any>(null);

  // Datos empresa (no los usa Python, pero no estorban)
  const companyNameRef = useRef<HTMLInputElement>(null);
  const rucRef = useRef<HTMLInputElement>(null);
  const sectorRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  // Señales digitales
  const twitterHandleRef = useRef<HTMLInputElement>(null);
  const instagramRef = useRef<HTMLInputElement>(null);
  const mapsUrlRef = useRef<HTMLInputElement>(null);  // informativo
  const placeIdRef = useRef<HTMLInputElement>(null);

  // Archivos
  const ieFormRef = useRef<HTMLInputElement>(null);       // no lo usa Python
  const balanceFormRef = useRef<HTMLInputElement>(null);  // Excel -> balance
  const creditReqRef = useRef<HTMLInputElement>(null);    // PDF -> historico

  // Parámetros de la solicitud
  const [amount, setAmount] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [purpose, setPurpose] = useState<string | null>(null);

  const editAmount = () => {
    const v = prompt('Cantidad solicitada (USD):', amount ?? '');
    if (v !== null) setAmount(v.trim() || null);
  };
  const editDuration = () => {
    const v = prompt('Duración (meses):', duration ?? '');
    if (v !== null) setDuration(v.trim() || null);
  };
  const editPurpose = () => {
    const v = prompt('Motivo del crédito:', purpose ?? '');
    if (v !== null) setPurpose(v.trim() || null);
  };

  const onSubmit: React.FormEventHandler = async e => {
    e.preventDefault();
    setErr(null); setLoading(true);
    setTicket(null); setProcStatus('idle'); setResult(null);

    try {
      // Validaciones mínimas
      const companyName = companyNameRef.current?.value?.trim() || '';
      if (!companyName) throw new Error('Nombre de empresa es requerido');

      const balanceFile = balanceFormRef.current?.files?.[0];
      const historicoPDF = creditReqRef.current?.files?.[0];
      if (!balanceFile) throw new Error('Falta subir el Balance (Excel .xlsx/.xls)');
      if (!historicoPDF) throw new Error('Falta subir la Solicitud/Histórico (PDF)');

      if (!/\.(xlsx|xls)$/i.test(balanceFile.name)) throw new Error('El Balance debe ser .xlsx o .xls');
      if (!/\.pdf$/i.test(historicoPDF.name)) throw new Error('El Histórico debe ser .pdf');

      const balanceB64  = await fileToBase64(balanceFile);
      const historicoB64 = await fileToBase64(historicoPDF);

      const cantidad = Number(amount || 0);
      const duracion = Number(duration || 0);

      const payload = {
        historico: historicoB64,
        balance: balanceB64,
        cantidad,
        duracion,
        motivo: String(purpose || ''),
        twitterUsername: sanitizeHandle(twitterHandleRef.current?.value),
        instagramUsername: String(instagramRef.current?.value || ''),
        placeID: String(placeIdRef.current?.value || '')
      };

      // POST directo al FastAPI
      const res = await fetch(`${PY_API}/iniciar-proceso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`Error al iniciar proceso (${res.status})`);
      const out = await res.json();
      const t = out?.ticket as string | undefined;
      if (!t) throw new Error('El backend no devolvió ticket');
      setTicket(t);
      setProcStatus('processing');
    } catch (e: any) {
      setErr(e?.message || 'No se pudo enviar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  // Polling de estado cada 4s cuando hay ticket
   useEffect(() => {
    if (procStatus !== 'processing' || !ticket) return;
    let active = true;
    const iv = setInterval(async () => {
      try {
        const r = await fetch(`${PY_API}/estado-proceso/${encodeURIComponent(ticket)}`);
        if (!active) return;
        if (r.ok) {
          const data = await r.json();
          const st = String(data.estatus || '').toLowerCase();
          if (st && st !== 'processing' && st !== 'pendiente') {
            // listo: guardamos y navegamos con los datos
            setProcStatus('done');
            setResult(data.result ?? null);
            clearInterval(iv);

            // opcional: persistir por si recargan
            // sessionStorage.setItem('last_dashboard_data', JSON.stringify(data.result ?? {}));

            // 👇 navega al dashboard con el payload de Python
            navigate(`/dashboard/${ticket}`, {
              replace: true,
              state: { data: data.result ?? null }
            });
          }
        }
      } catch {
        // meh, reintenta en el próximo tick
      }
    }, 4000);
    return () => { active = false; clearInterval(iv); };
  }, [procStatus, ticket, navigate]);

  return (
    <Shell title="Nueva evaluación" subtitle="Carga la información mínima para iniciar el scoring">
      <form className={styles.form} onSubmit={onSubmit}>

        <div className={styles.grid}>
          {/* Datos de empresa */}
          <div className={styles.card}>
            <h3>Datos de la empresa</h3>
            <TextField ref={companyNameRef} label="Nombre de la empresa" placeholder="Panadería La Nube" />
            <TextField ref={rucRef} label="RUC" placeholder="1234567890001" />
            <TextField ref={sectorRef} label="Sector" placeholder="Alimentos" />
            <TextField ref={emailRef} label="Correo de contacto" type="email" placeholder="contacto@empresa.com" />
          </div>

          {/* Señales digitales */}
          <div className={styles.card}>
            <h3>Señales digitales</h3>
            <TextField ref={twitterHandleRef} label="Twitter (@usuario)" placeholder="@miempresa" />
            <TextField ref={instagramRef} label="Instagram (cuenta)" placeholder="miempresa" />
            <TextField ref={mapsUrlRef} label="Google Maps (URL)" placeholder="https://maps.app.goo.gl/..." />
            <TextField ref={placeIdRef} label="Place ID (Google Maps)" placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4" />
            <a
              className={styles.helpLink}
              href="https://maps.app.goo.gl/xtntp8ETd1x7Er4E6"
              target="_blank"
              rel="noopener noreferrer"
            >
              ¿No sabes tu Place ID?
            </a>
          </div>

          {/* Estados financieros y solicitud */}
          <div className={styles.card}>
            <h3>Estados financieros</h3>

            {/* Ingresos / Egresos */}
            <div className={styles.ieRow}>
              <div>
                <div className={styles.label}>Ingresos y egresos</div>
                <label className={styles.uploadGhost}>
                  <input
                    ref={ieFormRef}
                    type="file"
                    accept=".xlsx,.xls,.csv,.pdf,.xltx"
                    hidden
                  />
                  Subir formato I/E
                </label>
                <a className={styles.download} href="/forms/ingresos-egresos.xltx" download>
                  Descargar plantilla (XLTX)
                </a>
                <div className={styles.subtle}>Descarga la plantilla, complétala y luego súbela como .xlsx/.xls.</div>
              </div>
            </div>

            {/* Balance */}
            <div className={styles.fileRow}>
              <div className={styles.label}>Balance general</div>
              <label className={styles.uploadGhost}>
                <input ref={balanceFormRef} type="file" accept=".xlsx,.pdf" hidden />
                Subir balance
              </label>
              <div className={styles.subtle}>Con formato de la SuperCias</div>
            </div>

            {/* Parámetros + Solicitud de crédito */}
            <div className={styles.reqGrid}>
              <div className={styles.leftStack}>
                <button type="button" className={styles.paramBtn} onClick={editAmount}>
                  Cantidad {amount ? <em>(${amount})</em> : null}
                </button>
                <button type="button" className={styles.paramBtn} onClick={editDuration}>
                  Duración {duration ? <em>({duration} m)</em> : null}
                </button>
                <button type="button" className={styles.paramBtn} onClick={editPurpose}>
                  Motivo {purpose ? <em>({purpose})</em> : null}
                </button>
              </div>

              <div className={styles.bigUploadWrap}>
                <label className={styles.bigUpload}>
                  <input ref={creditReqRef} type="file" accept=".pdf" hidden />
                  Subir solicitud de crédito (PDF)
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Button disabled={loading} type="submit">{loading ? 'Enviando…' : 'Iniciar evaluación'}</Button>
        </div>
        {err ? <div className={styles.err}>{err}</div> : null}
      </form>

      {/* Estado del proceso Python */}
      {ticket ? (
        <div className={styles.procBox}>
          <div className={styles.procRow}><span>Ticket</span><code>{ticket}</code></div>
          <div className={styles.procRow}><span>Estado</span><b>{procStatus === 'processing' ? 'Procesando…' : procStatus}</b></div>
          {procStatus === 'processing' ? <div className={styles.hint}>Consultando estado cada 4s…</div> : null}
          {procStatus === 'done' && result ? (
            <pre className={styles.resultPreview}>{JSON.stringify(result, null, 2)}</pre>
          ) : null}
        </div>
      ) : null}
    </Shell>
  );
}
