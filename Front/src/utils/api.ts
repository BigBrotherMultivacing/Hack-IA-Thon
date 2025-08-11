const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:45766';

export type LoginPayload = { email: string; password: string };
export type LoginResponse = {
  token: string;
  user: { id: number; name: string; email: string };
};

export type CompanyRef = { id: string; name: string; ruc?: string; sector?: string };

export type DashboardData = {
  company: CompanyRef & { became_large_year?: number };
  scoring: {
    score: number;                 // 0..900
    risk: 'Bajo' | 'Medio' | 'Alto';
    credit_limit: number;          // recomendado en USD
    pd12: number;                  // prob. default 12m (0..1)
  };
  social: {
    twitter: { sentiment: number; volume_30d: number; trend30: number[]; top_terms: string[] };
    maps: { rating: number; reviews_count: number; trend30: number[]; samples: { author: string; rating: number; text: string; ts: string }[] };
    combined_sentiment: number;    // 0..100
  };
  financials: {
    years: number[];               // ej: [2018,2019,...]
    revenue: number[];             // USD por año
    ebitda_margin: number[];       // 0..1 por año
    cash_flow: number[];           // USD por año
    sector: string;
    sector_benchmarks: {           // percentiles sectoriales
      revenue_p50: number; revenue_p90: number; score_p50: number; score_p90: number;
    };
  };
  explanation: { features: { name: string; value: number; contribution: number }[] };
};

export type NewApplicationPayload = {
  companyName: string;
  ruc?: string;
  sector?: string;
  contactEmail?: string;
  twitterUrl?: string;      // o @handle
  mapsUrl?: string;         // URL del lugar
  references?: string;      // texto libre o CSV pegado
};

export async function listCompanies(): Promise<CompanyRef[]> {
  const res = await fetch(`${API_URL}/api/companies`, { credentials: 'include' });
  if (!res.ok) throw new Error('No se pudo cargar empresas');
  return res.json();
}

export async function getDashboard(companyId: string): Promise<DashboardData> {
  const res = await fetch(`${API_URL}/api/dashboard/${companyId}`, { credentials: 'include', headers: { ...getAuthHeader() } });
  if (!res.ok) throw new Error('No se pudo cargar el dashboard');
  return res.json();
}

export async function simulate(companyId: string, delta: { revenuePct?: number; ontimePct?: number; rating?: number }): Promise<{ score: number; risk: 'Bajo'|'Medio'|'Alto'; credit_limit: number }> {
  const res = await fetch(`${API_URL}/api/dashboard/${companyId}/simulate`, {
    method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', ...getAuthHeader() }, body: JSON.stringify(delta)
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

export async function createApplication(payload: NewApplicationPayload, files?: { statements?: File; extra?: File }): Promise<{ applicationId: string }>{
  const fd = new FormData();
  Object.entries(payload).forEach(([k,v]) => { if (v != null && v !== '') fd.append(k, String(v)); });
  if (files?.statements) fd.append('statements', files.statements);
  if (files?.extra) fd.append('extra', files.extra);

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

export async function getDashboardByApplication(appId: string): Promise<DashboardData> {
  const res = await fetch(`${API_URL}/api/dashboard/by-application/${appId}`, { credentials: 'include', headers: { ...getAuthHeader() } });
  if (!res.ok) throw new Error('No se pudo cargar el dashboard');
  return res.json();
}

