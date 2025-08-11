import React from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './Shell.module.css';

type Props = {
  title?: string;
  subtitle?: React.ReactNode;   // <- NUEVO
  children: React.ReactNode;
};

const Shell: React.FC<Props> = ({ title, subtitle, children }) => {
  const { signOut } = useAuth();

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>C</div>
        <nav className={styles.menu}>
          <a href="/dashboard/ultimo">Dashboard</a>
          <a href="/evaluate">Nueva evaluación</a>
          <a href="#">Empresas</a>
        </nav>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.titleWrap}>
            <h1 className={styles.title}>{title ?? 'Creencia'}</h1>
            {subtitle ? <div className={styles.subtitle}>{subtitle}</div> : null}
          </div>
          <button className={styles.logout} onClick={signOut}>Cerrar sesión</button>
        </header>

        <section className={styles.content}>{children}</section>
      </main>
    </div>
  );
};

export default Shell;
