// Petite base JSON (une seule personne / une petite équipe : pas besoin de serveur SQL).
import fs from 'node:fs';
import { PATHS } from './config.js';
import { bus } from './bus.js';

let db = { jobs: {}, connections: {}, oauthStates: {}, publicMedia: {} };
try { db = { ...db, ...JSON.parse(fs.readFileSync(PATHS.db, 'utf8')) }; } catch { /* base neuve */ }

let timer = null;
function persist() {
  clearTimeout(timer);
  timer = setTimeout(flush, 150);
}
export function flush() {
  clearTimeout(timer);
  const tmp = PATHS.db + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db), { mode: 0o600 });
  fs.renameSync(tmp, PATHS.db);
}

export const jobs = {
  get: (id) => db.jobs[id],
  list: () => Object.values(db.jobs).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  save(job) {
    job.updatedAt = new Date().toISOString();
    db.jobs[job.id] = job;
    persist();
    bus.emit('job', job);
    return job;
  },
  remove(id) { delete db.jobs[id]; persist(); bus.emit('job-removed', { id }); },
};

export const connections = {
  get: (net) => db.connections[net],
  all: () => db.connections,
  set(net, value) { db.connections[net] = { ...value, updatedAt: new Date().toISOString() }; persist(); bus.emit('connections'); },
  remove(net) { delete db.connections[net]; persist(); bus.emit('connections'); },
};

export const oauthStates = {
  put(state, value) { db.oauthStates[state] = { ...value, at: Date.now() }; persist(); },
  take(state) {
    const v = db.oauthStates[state];
    delete db.oauthStates[state];
    persist();
    return v && Date.now() - v.at < 15 * 60_000 ? v : null;
  },
  purge() {
    for (const [k, v] of Object.entries(db.oauthStates)) if (Date.now() - v.at > 15 * 60_000) delete db.oauthStates[k];
    persist();
  },
};

// Liens publics non devinables vers une vidéo (Instagram doit pouvoir la télécharger).
export const publicMedia = {
  put(token, file) { db.publicMedia[token] = { file, at: Date.now() }; persist(); },
  get: (token) => db.publicMedia[token],
  purge(maxAgeMs) {
    for (const [k, v] of Object.entries(db.publicMedia)) if (Date.now() - v.at > maxAgeMs) delete db.publicMedia[k];
    persist();
  },
};
