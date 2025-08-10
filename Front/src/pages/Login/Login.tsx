import React, { useRef, useState } from 'react';
import TextField from '../../components/TextField/TextField';
import Button from '../../components/Button/Button';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Brand from '../../components/Brand/Brand';
import styles from './Login.module.css';

// Valida formato básico de correo
function validateEmail(email: string){ return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email); }

// Página de inicio de sesión
export default function Login(){
  // Refs a inputs para leer valores imperativamente
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);

  // Estado local: "recordarme" y errores de formulario
  const [remember, setRemember] = useState(true);
  const [formErr, setFormErr] = useState<string | null>(null);

  // Navegación programática tras login
  const navigate = useNavigate();

  // Acciones/estado de auth global
  const { signIn, loading, error } = useAuth();

  // Manejador del submit del formulario
  const onSubmit: React.FormEventHandler = async e => {
    e.preventDefault();

    const email = emailRef.current?.value?.trim() || '';
    const password = passRef.current?.value || '';

    // Validaciones mínimas antes de llamar a la API
    if (!validateEmail(email)) return setFormErr('Correo inválido');
    if (password.length < 6) return setFormErr('La contraseña debe tener al menos 6 caracteres');

    setFormErr(null);

    // Llama a signIn (hace POST /api/auth/login), maneja loading/error desde el contexto
    await signIn({ email, password }, remember);

    // Pequeño timeout para esperar actualización del estado y luego redirigir
    setTimeout(() => { if (!error) navigate('/'); }, 50);
  };

  return (
    <div className="u-container"> {/* Contenedor centrado de la app */}
      <form className={["u-card", styles.card].join(' ')} onSubmit={onSubmit} noValidate>
        <Brand/> {/* Marca (logo + nombre + slogan) */}

        <div className={styles.hint}>Inicia sesión para acceder a tu panel.</div>

        {/* Campos de correo y contraseña */}
        <TextField ref={emailRef} label="Correo" name="email" type="email" autoComplete="email" placeholder="tucorreo@empresa.com"/>
        <TextField ref={passRef} label="Contraseña" name="password" type="password" autoComplete="current-password" placeholder="••••••••"/>

        {/* Recordarme + enlace a recuperación (placeholder) */}
        <div className={styles.row}>
          <label className={styles.checkbox}>
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
            Recordarme
          </label>
          <Link to="#" className={styles.link}>¿Olvidaste tu contraseña?</Link>
        </div>

        {/* Botón principal; deshabilita cuando está cargando */}
        <Button disabled={loading} type="submit">{loading ? 'Entrando…' : 'Entrar'}</Button>

        {/* Errores del formulario o del contexto de auth */}
        {formErr ? <div className={styles.err}>{formErr}</div> : null}
        {error ? <div className={styles.err}>{error}</div> : null}

        <div className={styles.badge}>Al continuar aceptas los Términos y la Política de Privacidad.</div>
      </form>
    </div>
  );
}
