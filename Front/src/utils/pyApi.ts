const PY_API = import.meta.env.VITE_PY_API_URL as string;

export type ProcessRequest = {
  historico: string;           // PDF base64 (sin el data:...; solo el chunk base64)
  balance: string;             // Excel base64
  cantidad: number;
  duracion: number;
  motivo: string;
  twitterUsername: string;
  instagramUsername: string;
  placeID: string;
};

export async function startProcess(body: ProcessRequest): Promise<{ ticket: string; message?: string }>{
  const res = await fetch(`${PY_API}/iniciar-proceso`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`Error al iniciar proceso (${res.status})`);
  return res.json();
}

export async function getProcessStatus(ticket: string): Promise<{ estatus: string; result?: any }>{
  const res = await fetch(`${PY_API}/estado-proceso/${encodeURIComponent(ticket)}`);
  if (!res.ok) throw new Error(`Error al consultar estado (${res.status})`);
  return res.json();
}

/** Util: convierte File a base64 (solo la parte base64, sin prefijo data:) */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error('No se pudo leer el archivo'));
    r.onload = () => {
      const result = String(r.result || '');
      const idx = result.indexOf('base64,');
      resolve(idx >= 0 ? result.slice(idx + 7) : result); // corta "data:...;base64,"
    };
    r.readAsDataURL(file);
  });
}

/** Util: limpia @ del handle de Twitter */
export function sanitizeHandle(v?: string){
  return (v || '').trim().replace(/^@+/, '');
}
