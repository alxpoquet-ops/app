import { useState } from 'react';
import { demoData, toISODate, type BusinessProfile, type TableName } from '@boss/core';
import { Field } from '../components/ui.tsx';
import { observe, save, setMeta } from '../lib/db.ts';
import { syncNow } from '../lib/sync.ts';

/** Premier lancement : 3 questions, ou un atelier d'exemple. */
export default function Welcome() {
  const [step, setStep] = useState<'choice' | 'form' | 'join'>('choice');
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [name, setName] = useState('');
  const [craft, setCraft] = useState('');
  const [city, setCity] = useState('');
  const [goal, setGoal] = useState('1500');

  async function demo() {
    const d = demoData(toISODate(new Date()));
    for (const [t, rows] of Object.entries(d)) await save(t as TableName, rows as never);
    await observe('onboarding', { mode: 'demo' });
  }

  async function start() {
    const p: BusinessProfile = {
      id: 'profile',
      updatedAt: Date.now(),
      businessName: name || 'Mon atelier',
      activity: 'artisan',
      craft,
      city,
      maxDistanceKm: 60,
      availability: { weekend: true, semaine: false, feries: true },
      maxEventsPerMonth: 2,
      maxStandBudget: 100,
      monthlyRevenueGoal: Number(goal) || 0,
    };
    await save('profile', p);
    await observe('onboarding', { mode: 'scratch' });
  }

  if (step === 'choice')
    return (
      <div className="stack" style={{ flex: 1, justifyContent: 'center' }}>
        <div style={{ fontSize: 72, textAlign: 'center' }}>👋</div>
        <div className="big-q" style={{ textAlign: 'center' }}>Je suis ton directeur d'atelier.</div>
        <p className="muted" style={{ textAlign: 'center' }}>
          Tu produis. Moi je réfléchis : quoi faire, quoi acheter, où exposer.
        </p>
        <button className="btn primary huge" onClick={() => setStep('form')}>C'EST PARTI</button>
        <button className="btn block" onClick={demo}>Voir avec un atelier d'exemple</button>
        <button className="btn ghost" onClick={() => setStep('join')}>J'ai déjà un compte sur un autre appareil</button>
      </div>
    );

  if (step === 'join')
    return (
      <div className="stack">
        <div className="big-q">Retrouver mon atelier</div>
        <Field label="Adresse du serveur (vide = cette adresse)">
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://boss.mon-atelier.fr" />
        </Field>
        <Field label="Jeton d'accès">
          <input type="password" value={token} onChange={(e) => setToken(e.target.value)} />
        </Field>
        <button className="btn primary huge" onClick={async () => (await setMeta('settings', { serverUrl: url.trim(), token: token.trim() }), syncNow())}>
          SYNCHRONISER
        </button>
        <button className="btn ghost" onClick={() => setStep('choice')}>Retour</button>
      </div>
    );

  return (
    <div className="stack">
      <div className="big-q">Présente-toi en 4 réponses</div>
      <Field label="Nom de ton activité">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="L'Atelier de…" />
      </Field>
      <Field label="Ce que tu fabriques">
        <input value={craft} onChange={(e) => setCraft(e.target.value)} placeholder="Bijoux, céramique, fleurs en fil…" />
      </Field>
      <Field label="Ta ville">
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Reims" />
      </Field>
      <Field label="Objectif de chiffre d'affaires par mois (€)">
        <input inputMode="numeric" value={goal} onChange={(e) => setGoal(e.target.value)} />
      </Field>
      <button className="btn primary huge" disabled={!craft || !city} onClick={start}>VALIDER</button>
      <p className="muted small">Tu ajouteras tes produits dans Réglages ⚙️. Tout le reste, je m'en occupe.</p>
    </div>
  );
}
