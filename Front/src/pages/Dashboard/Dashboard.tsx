import { useAuth } from '../../context/AuthContext';
import Shell from '../../layout/Shell';
import styles from './Dashboard.module.css';

export default function Dashboard(){
  const { user } = useAuth();
  return (
    <Shell title="Panel">
      <div className={styles.card}>
        <h2>Bienvenido, {user?.name ?? 'Usuario'}</h2>
        <p className={styles.muted}>Aquí vivirá el dashboard financiero de Creencia. Por ahora, el login funciona.</p>
      </div>
    </Shell>
  );
}
