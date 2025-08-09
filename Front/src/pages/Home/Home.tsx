import React from 'react';
import { Link } from 'react-router-dom';
import Brand from '../../components/Brand/Brand';
import styles from './Home.module.css';
import Button from '../../components/Button/Button';

const Home: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Brand />
        <h2 className={styles.title}>Bienvenido a Creencia</h2>
        <p className={styles.subtitle}>La plataforma que usa inteligencia artificial para evaluar el riesgo financiero de PYMEs de forma justa y eficiente.</p>
        <div className={styles.actions}>
          <Link to="/login"><Button>Iniciar sesión</Button></Link>
        </div>
      </div>
    </div>
  );
};

export default Home;