const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:45766';

export type LoginPayload = { email: string; password: string };
export type LoginResponse = {
  token: string;
  user: { id: number; name: string; email: string };
};

export type CompanyRef = { id: string; name: string; ruc?: string; sector?: string };

export type NewApplicationPayload = {
  companyName: string;
  ruc?: string;
  sector?: string;
  contactEmail?: string;

  twitterHandle?: string;
  instagramHandle?: string;
  mapsUrl?: string;
  mapsPlaceId?: string;

  references?: string;

  amount?: string;    // Cantidad solicitada
  duration?: string;  // meses
  purpose?: string;   // motivo
};

export type InstagramData = { score: number; engagement: number }; // engagement 0..1
export type MapsTwitterData = {
  negativo: { count: number; [k: string]: number };
  positivo: { count: number; [k: string]: number };
  neutral: number;
  retroalimentacion: string;
  score: number; // 0..100 o 1..5, te lo muestro como llega
};
export type PatrimonioData = { count: number; score: number }; // count = patrimonio (USD)
export type FlujoData = { ingresos: number; egresos: number; score: number };

export type DashboardDataV2Raw = {
  instagram: InstagramData;
  ['maps-twitter']: MapsTwitterData;
  patrimonio: PatrimonioData;
  balance: number;           // si el back lo usa para otra cosa, igual lo traigo
  flujo: FlujoData;
  score_total?: number;      // recomendado enviarlo desde el back
};

export type DashboardDataV2 = {
  instagram: InstagramData;
  mapsTwitter: MapsTwitterData;
  patrimonio: PatrimonioData;
  balance: number;
  flujo: FlujoData;
  score_total?: number;
};

export async function listCompanies(): Promise<CompanyRef[]> {
  const res = await fetch(`${API_URL}/api/companies`, { credentials: 'include' });
  if (!res.ok) throw new Error('No se pudo cargar empresas');
  return res.json();
}

function normalizeV2(raw: DashboardDataV2Raw): DashboardDataV2 {
  // @ts-ignore acceso con guion
  const mt = raw['maps-twitter'] as MapsTwitterData;
  return {
    instagram: raw.instagram,
    mapsTwitter: mt,
    patrimonio: raw.patrimonio,
    balance: raw.balance,
    flujo: raw.flujo,
    score_total: raw.score_total
  };
}

export async function getDashboardByApplication(appId: string): Promise<DashboardDataV2> {
  const res = await fetch(`${API_URL}/api/dashboard/by-application/${appId}`, {
    credentials: 'include', headers: { ...getAuthHeader() }
  });
  if (!res.ok) throw new Error('No se pudo cargar el dashboard');
  const raw = await res.json();
  return normalizeV2(raw);
}

// opcional: si quieres reusar el simulador antiguo para “score total”, mantenlo
export async function simulate(appId: string, body: any): Promise<any> {
  const res = await fetch(`${API_URL}/api/dashboard/${appId}/simulate`, {
    method: 'POST', credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error('No se pudo simular');
  return res.json();
}

/**
 * Función para iniciar sesión.
 * - Envía email y password al backend.
 * - Incluye cookies (credentials: 'include') si el backend usa sesión.
 * - Retorna token y datos del usuario si las credenciales son correctas.
 */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const msg = await safeErrorMessage(res);
    throw new Error(msg || 'Credenciales inválidas');
  }

  return res.json();
}

/**
 * Obtiene encabezado Authorization con token desde localStorage.
 * - Útil para llamadas protegidas al backend.
 */
export function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('creencia_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Intenta extraer un mensaje de error del backend de forma segura.
 */
async function safeErrorMessage(res: Response) {
  try {
    const data = await res.json();
    return data?.message || data?.error || res.statusText;
  } catch {
    return res.statusText;
  }
}

export async function createApplication(
  payload: NewApplicationPayload,
  files?: { ie_form?: File; balance_form?: File; credit_request?: File }
): Promise<{ applicationId: string }>{
  const fd = new FormData();
  Object.entries(payload).forEach(([k,v]) => { if (v != null && v !== '') fd.append(k, String(v)); });
  if (files?.ie_form) fd.append('ie_form', files.ie_form);
  if (files?.balance_form) fd.append('balance_form', files.balance_form);
  if (files?.credit_request) fd.append('credit_request', files.credit_request);

  const res = await fetch(`${API_URL}/api/applications`, {
    method: 'POST', credentials: 'include', headers: { ...getAuthHeader() }, body: fd
  });
  if (!res.ok) throw new Error('No se pudo crear la solicitud');
  return res.json();
}


export async function getApplicationStatus(appId: string): Promise<{ status: 'queued'|'processing'|'done'|'error'; dashboardReady?: boolean }>{
  const res = await fetch(`${API_URL}/api/applications/${appId}/status`, { credentials: 'include', headers: { ...getAuthHeader() } });
  if (!res.ok) throw new Error('No se pudo consultar el estado');
  return res.json();
}


