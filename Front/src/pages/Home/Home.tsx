import React from 'react';
import { Link } from 'react-router-dom';
import Brand from '../../components/Brand/Brand';
import styles from './Home.module.css';
import Button from '../../components/Button/Button';

// Landing pública simple en '/': muestra marca, mensaje y CTA a login
const Home: React.FC = () => {
  return (
    <div className={styles.container}>    {/* Contenedor que centra el contenido */}
      <div className={styles.content}>     {/* Card/área principal */}
        <Brand />                           {/* Marca superior */}
        <h2 className={styles.title}>Bienvenido a Creencia</h2>
        <p className={styles.subtitle}>
          La plataforma que usa inteligencia artificial para evaluar el riesgo financiero de PYMEs de forma justa y eficiente.
        </p>
        <div className={styles.actions}>   {/* Área de acciones principales */}
          <Link to="/login"><Button>Iniciar sesión</Button></Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
