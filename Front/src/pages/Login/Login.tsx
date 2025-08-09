import React, { useRef, useState } from 'react';
import TextField from '../../components/TextField/TextField';
import Button from '../../components/Button/Button';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Brand from '../../components/Brand/Brand';
import styles from './Login.module.css';

function validateEmail(email: string){ return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email); }

export default function Login(){
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);
  const [remember, setRemember] = useState(true);
  const [formErr, setFormErr] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signIn, loading, error } = useAuth();

  const onSubmit: React.FormEventHandler = async e => {
    e.preventDefault();
    const email = emailRef.current?.value?.trim() || '';
    const password = passRef.current?.value || '';
    if (!validateEmail(email)) return setFormErr('Correo inválido');
    if (password.length < 6) return setFormErr('La contraseña debe tener al menos 6 caracteres');
    setFormErr(null);
    await signIn({ email, password }, remember);
    setTimeout(() => { if (!error) navigate('/'); }, 50);
  };

  return (
    <div className="u-container">
      <form className={["u-card", styles.card].join(' ')} onSubmit={onSubmit} noValidate>
        <Brand/>
        <div className={styles.hint}>Inicia sesión para acceder a tu panel.</div>

        <TextField ref={emailRef} label="Correo" name="email" type="email" autoComplete="email" placeholder="tucorreo@empresa.com"/>
        <TextField ref={passRef} label="Contraseña" name="password" type="password" autoComplete="current-password" placeholder="••••••••"/>

        <div className={styles.row}>
          <label className={styles.checkbox}>
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
            Recordarme
          </label>
          <Link to="#" className={styles.link}>¿Olvidaste tu contraseña?</Link>
        </div>

        <Button disabled={loading} type="submit">{loading ? 'Entrando…' : 'Entrar'}</Button>

        {formErr ? <div className={styles.err}>{formErr}</div> : null}
        {error ? <div className={styles.err}>{error}</div> : null}

        <div className={styles.badge}>Al continuar aceptas los Términos y la Política de Privacidad.</div>
      </form>
    </div>
  );
}
