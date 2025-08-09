import React from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './Shell.module.css';

const Shell: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => {
  const { signOut } = useAuth();
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>C</div>
        <nav className={styles.menu}>
          <a href="#">Dashboard</a>
          <a href="#">Empresas</a>
          <a href="#">Scoring</a>
        </nav>
      </aside>
      <main className={styles.main}>
        <header className={styles.header}>
          <h1>{title ?? 'Creencia'}</h1>
          <button className={styles.logout} onClick={signOut}>Cerrar sesión</button>
        </header>
        <section className={styles.content}>{children}</section>
      </main>
    </div>
  );
};
export default Shell;
