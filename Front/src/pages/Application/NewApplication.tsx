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

  const companyNameRef = useRef<HTMLInputElement>(null);
  const rucRef = useRef<HTMLInputElement>(null);
  const sectorRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const twitterRef = useRef<HTMLInputElement>(null);
  const mapsRef = useRef<HTMLInputElement>(null);
  const referencesRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onSubmit: React.FormEventHandler = async e => {
    e.preventDefault();
    setErr(null); setLoading(true);
    try {
      const statements = fileRef.current?.files?.[0];
      const payload = {
        companyName: companyNameRef.current?.value?.trim() || '',
        ruc: rucRef.current?.value?.trim() || undefined,
        sector: sectorRef.current?.value?.trim() || undefined,
        contactEmail: emailRef.current?.value?.trim() || undefined,
        twitterUrl: twitterRef.current?.value?.trim() || undefined,
        mapsUrl: mapsRef.current?.value?.trim() || undefined,
        references: referencesRef.current?.value?.trim() || undefined,
      };
      if (!payload.companyName) throw new Error('Nombre de empresa es requerido');
      const { applicationId } = await createApplication(payload, { statements });
      navigate(`/dashboard/${applicationId}`); // redirige al dashboard de la solicitud
    } catch (e: any) {
      setErr(e?.message || 'No se pudo enviar la solicitud');
    } finally { setLoading(false); }
  };

  return (
    <Shell title="Nueva evaluación" subtitle="Carga la información mínima para iniciar el scoring">
      <form className={styles.form} onSubmit={onSubmit}>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Datos de la empresa</h3>
            <TextField ref={companyNameRef} label="Nombre de la empresa" placeholder="Panadería La Nube" />
            <TextField ref={rucRef} label="RUC" placeholder="1234567890001" />
            <TextField ref={sectorRef} label="Sector" placeholder="Alimentos" />
            <TextField ref={emailRef} label="Correo de contacto" type="email" placeholder="contacto@empresa.com" />
          </div>

          <div className={styles.card}>
            <h3>Señales digitales</h3>
            <TextField ref={twitterRef} label="Twitter (perfil o URL)" placeholder="https://twitter.com/miempresa" />
            <TextField ref={mapsRef} label="Google Maps (URL)" placeholder="https://maps.app.goo.gl/..." />
            <label className={styles.label}>Referencias (opcional)</label>
            <textarea ref={referencesRef} className={styles.textarea} rows={5} placeholder="Proveedor A: 2 años, pagos a tiempo
Proveedor B: 1 año, 1 retraso menor"></textarea>
          </div>

          <div className={styles.card}>
            <h3>Estados financieros</h3>
            <label className={styles.label}>Sube el archivo de la SCVS (PDF/XLS)</label>
            <input ref={fileRef} type="file" accept=".pdf,.xlsx,.xls" className={styles.file} />
            <div className={styles.hint}>Puedes descargar desde la SCVS y subir al sistema.</div>
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