import React, { useRef, useState } from 'react';
import Shell from '../../layout/Shell';
import TextField from '../../components/TextField/TextField';
import Button from '../../components/Button/Button';
import styles from './NewApplication.module.css';
import { createApplication } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

export default function NewApplication(){
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Datos empresa
  const companyNameRef = useRef<HTMLInputElement>(null);
  const rucRef = useRef<HTMLInputElement>(null);
  const sectorRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  // Señales digitales
  const twitterHandleRef = useRef<HTMLInputElement>(null);
  const instagramRef = useRef<HTMLInputElement>(null);
  const mapsUrlRef = useRef<HTMLInputElement>(null);
  const placeIdRef = useRef<HTMLInputElement>(null);
  const referencesRef = useRef<HTMLTextAreaElement>(null);

  // Archivos
  const ieFormRef = useRef<HTMLInputElement>(null);       // ingresos/egresos
  const balanceFormRef = useRef<HTMLInputElement>(null);  // balance
  const creditReqRef = useRef<HTMLInputElement>(null);    // solicitud de crédito

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
    try {
      const payload = {
        companyName: companyNameRef.current?.value?.trim() || '',
        ruc: rucRef.current?.value?.trim() || undefined,
        sector: sectorRef.current?.value?.trim() || undefined,
        contactEmail: emailRef.current?.value?.trim() || undefined,

        twitterHandle: twitterHandleRef.current?.value?.trim() || undefined,
        instagramHandle: instagramRef.current?.value?.trim() || undefined,
        mapsUrl: mapsUrlRef.current?.value?.trim() || undefined,
        mapsPlaceId: placeIdRef.current?.value?.trim() || undefined,

        references: referencesRef.current?.value?.trim() || undefined,

        amount: amount ?? undefined,
        duration: duration ?? undefined,
        purpose: purpose ?? undefined
      };

      if (!payload.companyName) throw new Error('Nombre de empresa es requerido');

      const files = {
        ie_form: ieFormRef.current?.files?.[0],
        balance_form: balanceFormRef.current?.files?.[0],
        credit_request: creditReqRef.current?.files?.[0],
      };

      const { applicationId } = await createApplication(payload, files);
      navigate(`/dashboard/${applicationId}`);
    } catch (e: any) {
      setErr(e?.message || 'No se pudo enviar la solicitud');
    } finally { setLoading(false); }
  };

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
              href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder"
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
                  <input ref={ieFormRef} type="file" accept=".xlsx,.xls,.csv,.pdf" hidden />
                  Subir formato I/E
                </label>
                <a className={styles.download} href="/forms/ingresos-egresos.xlsx" download>
                  Descargar formato
                </a>
              </div>
            </div>

            {/* Balance */}
            <div className={styles.fileRow}>
              <div className={styles.label}>Balance general</div>
              <label className={styles.uploadGhost}>
                <input ref={balanceFormRef} type="file" accept=".pdf,.xlsx,.xls" hidden />
                Subir balance
              <div className={styles.subtle}>Con formato de la SuperCias</div>

              </label>
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
                  <input ref={creditReqRef} type="file" accept=".pdf,.doc,.docx" hidden />
                  Subir solicitud de crédito
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
    </Shell>
  );
}
