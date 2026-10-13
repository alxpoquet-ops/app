/** Appels aux agents IA du serveur. L'app reste utilisable sans eux. */
import { getSettings } from './db.ts';
import { apiBase } from './sync.ts';

export class AiError extends Error {}

export async function callAgent<T>(path: string, body: unknown): Promise<T> {
  const { serverUrl, token } = await getSettings();
  let res: Response;
  try {
    res = await fetch(`${apiBase(serverUrl)}/api/ai/${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    });
  } catch {
    throw new AiError("Pas de connexion au serveur. Tout le reste marche hors-ligne.");
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new AiError(json.error ?? `Erreur ${res.status}`);
  return json as T;
}

export async function executeAction(id: string): Promise<{ mode: string; message: string; openUrl?: string }> {
  const { serverUrl, token } = await getSettings();
  const res = await fetch(`${apiBase(serverUrl)}/api/actions/${id}/execute`, {
    method: 'POST',
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new AiError(json.error ?? `Erreur ${res.status}`);
  return json;
}

export async function serverHealth(): Promise<{ ok: boolean; ai: boolean } | null> {
  const { serverUrl } = await getSettings();
  try {
    const r = await fetch(`${apiBase(serverUrl)}/api/health`);
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  }
}
