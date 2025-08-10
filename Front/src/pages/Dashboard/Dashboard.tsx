import { useAuth } from '../../context/AuthContext';
import Shell from '../../layout/Shell';
import KPI from '../../components/KPI/KPI';
import styles from './Dashboard.module.css';

export default function Dashboard(){
  const { user } = useAuth();

  return (
    <Shell
      title="Panel"
      subtitle={<>Bienvenido, <strong>{user?.name ?? 'Usuario'}</strong></>}
    >
      <div className={styles.grid}>
        {/* KPI principales */}
        <section className={styles.kpis}>
          <KPI title="Riesgo actual" value="Bajo" subtitle="Score alternativo 782/900" progress={78} trend={{ dir: 'up', delta: '+4 pts vs. semana' }} />
          <KPI title="Prob. estimada de impago" value="2.1%" subtitle="Horizonte 12 meses" progress={98} trend={{ dir: 'down', delta: '-0.3 pp' }} />
          <KPI title="Salud digital" value="81/100" subtitle="Reputación y actividad" progress={81} trend={{ dir: 'up', delta: '+6' }} />
        </section>

        {/* Acciones rápidas */}
        <section className={styles.quick}>
          <div className={styles.cardAction}>
            <h3>Evaluar PYME</h3>
            <p>Genera un score con archivos y señales digitales.</p>
            <button className={styles.ghost}>Nueva evaluación</button>
          </div>
          <div className={styles.cardAction}>
            <h3>Subir estados financieros</h3>
            <p>PDF o XLS desde la Super de Compañías.</p>
            <button className={styles.ghost}>Subir documentos</button>
          </div>
          <div className={styles.cardAction}>
            <h3>Conectar redes</h3>
            <p>Instagram o Facebook para reputación.</p>
            <button className={styles.ghost}>Conectar cuenta</button>
          </div>
        </section>

        {/* Lista de empresas recientes */}
        <section className={styles.list}>
          <div className={styles.listHeader}>
            <h3>Empresas recientes</h3>
          </div>
          <div className={styles.table}>
            <div className={styles.row + ' ' + styles.head}>
              <div>Empresa</div><div>Sector</div><div>Score</div><div>Riesgo</div><div>Estado</div>
            </div>
            {[
              { name: 'Panadería La Nube', sector: 'Alimentos', score: 782, risk: 'Bajo', estado: 'Listo' },
              { name: 'Ferretería El Tornillo', sector: 'Retail', score: 641, risk: 'Medio', estado: 'Revisar' },
              { name: 'Textiles Quito', sector: 'Manufactura', score: 512, risk: 'Medio', estado: 'Faltan docs' },
            ].map((r, i) => (
              <div key={i} className={styles.row}>
                <div>{r.name}</div>
                <div className={styles.muted}>{r.sector}</div>
                <div>{r.score}</div>
                <div><span className={styles.badge + ' ' + styles['risk' + r.risk]}>{r.risk}</span></div>
                <div className={styles.muted}>{r.estado}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Shell>
  );
}
