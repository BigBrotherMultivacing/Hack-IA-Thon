import { useEffect, useState } from 'react';
import { listCompanies, type CompanyRef } from '../../utils/api';
import styles from './CompanySelect.module.css';

export default function CompanySelect({ value, onChange }: { value?: string; onChange: (id: string) => void }){
  const [items, setItems] = useState<CompanyRef[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => { try { setItems(await listCompanies()); } finally { setLoading(false); } })(); }, []);

  return (
    <div className={styles.wrap}>
      <label>Empresa</label>
      <select disabled={loading} value={value} onChange={e => onChange(e.target.value)}>
        <option value="">Selecciona…</option>
        {items.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
    </div>
  );
}