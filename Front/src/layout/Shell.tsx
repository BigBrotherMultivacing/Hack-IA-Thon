import React from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './Shell.module.css';

// Layout de aplicación autenticada: sidebar + header + área de contenidos
const Shell: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => {
  const { signOut } = useAuth(); // Acción para cerrar sesión

  return (
    <div className={styles.shell}> {/* Grid con columnas: sidebar + main */}
      <aside className={styles.sidebar}> {/* Navegación lateral */}
        <div className={styles.logo}>C</div> {/* Marca compacta */}
        <nav className={styles.menu}>
          <a href="#">Dashboard</a>
          <a href="#">Empresas</a>
          <a href="#">Scoring</a>
        </nav>
      </aside>

      <main className={styles.main}> {/* Columna principal */}
        <header className={styles.header}> {/* Barra superior con título y acciones */}
          <h1>{title ?? 'Creencia'}</h1>
          <button className={styles.logout} onClick={signOut}>Cerrar sesión</button>
        </header>

        {/* Contenido variable que inyectan las páginas */}
        <section className={styles.content}>{children}</section>
      </main>
    </div>
  );
};

export default Shell;
