import { useAuth } from '../../context/AuthContext';
import Shell from '../../layout/Shell';
import styles from './Dashboard.module.css';

// Página simple de dashboard para validar el flujo de login y layout
export default function Dashboard(){
  const { user } = useAuth(); // Datos del usuario autenticado

  return (
    <Shell title="Panel"> {/* Usa el layout con título personalizado */}
      <div className={styles.card}> {/* Tarjeta de bienvenida */}
        <h2>Bienvenido, {user?.name ?? 'Usuario'}</h2>
        <p className={styles.muted}>
          Aquí vivirá el dashboard financiero de Creencia. Por ahora, el login funciona.
        </p>
      </div>
    </Shell>
  );
}
