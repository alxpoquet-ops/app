// Requêtes HTTP vers les réseaux, avec messages d'erreur lisibles.
import fs from 'node:fs';

export class PublishError extends Error {
  constructor(message, { retryable = false, status } = {}) {
    super(message);
    this.retryable = retryable;
    this.status = status;
  }
}

function extractMessage(data) {
  if (!data) return '';
  if (typeof data === 'string') return data.slice(0, 300);
  return data.error?.message || data.error_description || data.error?.error_user_msg || data.detail || data.title
    || data.message || data.errors?.[0]?.message || data.error?.code || (typeof data.error === 'string' ? data.error : '') || JSON.stringify(data).slice(0, 300);
}

export async function request(url, { method = 'GET', headers = {}, body, json, form, timeout = 120_000 } = {}) {
  const opts = { method, headers: { ...headers }, signal: AbortSignal.timeout(timeout) };
  if (json !== undefined) {
    opts.body = JSON.stringify(json);
    opts.headers['Content-Type'] = opts.headers['Content-Type'] || 'application/json; charset=UTF-8';
  } else if (form) {
    opts.body = new URLSearchParams(Object.entries(form).filter(([, v]) => v !== undefined && v !== null).map(([k, v]) => [k, String(v)]));
  } else if (body !== undefined) {
    opts.body = body;
  }
  let res;
  try {
    res = await fetch(url, opts);
  } catch (err) {
    throw new PublishError(`Réseau injoignable (${err.cause?.code || err.name})`, { retryable: true });
  }
  const text = await res.text();
  let data = text;
  try { data = text ? JSON.parse(text) : {}; } catch { /* réponse texte */ }
  if (!res.ok) {
    throw new PublishError(`${res.status} — ${extractMessage(data)}`, { retryable: res.status >= 500 || res.status === 429, status: res.status });
  }
  return { data, res };
}

export const fileBlob = (file, type = 'video/mp4') => fs.openAsBlob(file, { type });

export async function readChunk(file, start, length) {
  const fh = await fs.promises.open(file, 'r');
  try {
    const buf = Buffer.alloc(length);
    const { bytesRead } = await fh.read(buf, 0, length, start);
    return buf.subarray(0, bytesRead);
  } finally {
    await fh.close();
  }
}

export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
