const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:45766';

export type LoginPayload = { email: string; password: string };
export type LoginResponse = { token: string; user: { id: number; name: string; email: string } };

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

export function getAuthHeader() {
  const token = localStorage.getItem('creencia_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function safeErrorMessage(res: Response) {
  try {
    const data = await res.json();
    return data?.message || data?.error || res.statusText;
  } catch {
    return res.statusText;
  }
}