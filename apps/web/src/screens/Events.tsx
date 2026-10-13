/**
 * ÉVÉNEMENTS : l'éclaireur cherche, le cerveau classe (🔥 / 👍 / 💤) et explique,
 * la mémoire apprend des bilans. Onglet Publications : vidéos / photos → reels & posts.
 * Candidatures et publications : préparées par l'IA, envoyées seulement après validation.
 */
import { useState } from 'react';
import {
  newId,
  rankEvents,
  slugify,
  type Approval,
  type EventResult,
  type MarketEvent,
  type MediaIdea,
  type RankedEvent,
  type Snapshot,
} from '@boss/core';
import { Bar, Empty, Field, Modal, useBusy, useToast } from '../components/ui.tsx';
import { callAgent, executeAction } from '../lib/api.ts';
import { db, observe, save } from '../lib/db.ts';
import { euros, frDate, useRows, useSnapshot } from '../lib/hooks.ts';
import { imageToDataUrl, videoKeyframes } from '../lib/media.ts';
import { syncNow } from '../lib/sync.ts';

const TIER = { prioritaire: '🔥 Prioritaire', interessant: '👍 Intéressant', faible: '💤 Faible intérêt' };

export default function Events() {
  const s = useSnapshot();
  const approvals = useRows('approvals');
  const [tab, setTab] = useState<'marches' | 'pubs'>('marches');
  if (!s || !approvals) return null;
  const pending = approvals.filter((a) => a.status === 'en_attente' && (a.kind === 'candidature' || a.kind === 'publication'));
  return (
    <>
      <Bar title="ÉVÉNEMENTS" />
      <div className="seg">
        <button className={tab === 'marches' ? 'on' : ''} onClick={() => setTab('marches')}>🎪 Marchés</button>
        <button className={tab === 'pubs' ? 'on' : ''} onClick={() => setTab('pubs')}>🎬 Publications</button>
      </div>
      {pending.length > 0 && <Pending list={pending} s={s} />}
      {tab === 'marches' ? <Markets s={s} /> : <Publications s={s} />}
    </>
  );
}

// ------------------------------------------------------------------ Validations en attente

function Pending({ list, s }: { list: Approval[]; s: Snapshot }) {
  const [open, setOpen] = useState<Approval | null>(null);
  const toast = useToast();
  async function decide(a: Approval, ok: boolean) {
    const decided: Approval = { ...a, status: ok ? 'approuve' : 'refuse', decidedAt: Date.now() };
    await save('approvals', decided);
    await observe(ok ? 'approval_ok' : 'approval_no', { kind: a.kind, id: a.id });
    if (ok && a.kind === 'candidature') {
      const ev = s.events.find((e) => e.id === a.payload.eventId);
      if (ev) await save('events', { ...ev, status: 'candidature' });
    }
    if (ok && a.kind === 'publication') {
      await navigator.clipboard?.writeText(String(a.payload.caption ?? '')).catch(() => undefined);
      const idea = await db.t('media').get(String(a.payload.mediaId));
      if (idea) await save('media', { ...idea, status: 'publie' });
    }
    setOpen(null);
    if (ok) {
      await syncNow();
      const r = await executeAction(a.id).catch(() => null);
      if (r?.openUrl) window.open(r.openUrl, '_blank', 'noopener');
      toast(r?.message ?? 'Validé ✓');
    }
  }
  return (
    <div className="stack">
      <strong>À valider ({list.length})</strong>
      {list.map((a) => (
        <button key={a.id} className="line" style={{ textAlign: 'left' }} onClick={() => setOpen(a)}>
          <span style={{ fontSize: 28 }}>{a.kind === 'candidature' ? '✉️' : '📱'}</span>
          <div className="grow"><div className="name">{a.title}</div><div className="small muted">{a.summary}</div></div>
          <span className="pill interessant">Relire</span>
        </button>
      ))}
      {open && (
        <Modal onClose={() => setOpen(null)}>
          <div className="big-q">{open.title}</div>
          {open.kind === 'candidature' ? (
            <>
              <strong>{String(open.payload.subject ?? '')}</strong>
              <pre className="draft">{String(open.payload.letter ?? '')}</pre>
              <strong>Présentation</strong>
              <pre className="draft">{String(open.payload.presentation ?? '')}</pre>
              <strong>Dossier</strong>
              <ul>{(open.payload.dossier as string[] | undefined)?.map((d, i) => <li key={i}>{d}</li>)}</ul>
              <strong>Photos</strong>
              <ul>{(open.payload.photoAdvice as string[] | undefined)?.map((d, i) => <li key={i}>{d}</li>)}</ul>
            </>
          ) : (
            <>
              <pre className="draft">{String(open.payload.caption ?? '')}</pre>
              <div className="small muted">{(open.payload.hashtags as string[] | undefined)?.join(' ')}</div>
            </>
          )}
          <button className="btn go huge" onClick={() => decide(open, true)}>✓ JE VALIDE</button>
          <button className="btn" onClick={() => decide(open, false)}>Refuser</button>
        </Modal>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ Marchés

function Markets({ s }: { s: Snapshot }) {
  const toast = useToast();
  const { busy, run } = useBusy();
  const [detail, setDetail] = useState<RankedEvent | null>(null);
  const [bilan, setBilan] = useState<MarketEvent | null>(null);
  const ranked = rankEvents(s);
  const toReview = s.events.filter((e) => e.status === 'inscrit' && (e.endDate ?? e.date) < s.today);

  const search = () =>
    run('search', async () => {
      const p = s.profile!;
      const known = s.events.map((e) => `${e.name} (${e.date})`);
      const res = await callAgent<{ events: (Omit<MarketEvent, 'id' | 'updatedAt' | 'seriesKey' | 'status'> & Record<string, unknown>)[] }>('events', {
        profile: p,
        today: s.today,
        months: 4,
        known,
      });
      const existing = new Set(s.events.map((e) => `${e.seriesKey}|${e.date}`));
      const fresh: MarketEvent[] = [];
      for (const e of res.events) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date) || e.date < s.today) continue;
        const seriesKey = slugify(e.name);
        if (existing.has(`${seriesKey}|${e.date}`)) continue;
        fresh.push({
          id: newId(),
          updatedAt: Date.now(),
          name: e.name,
          seriesKey,
          city: e.city,
          date: e.date,
          endDate: (e.endDate as string) ?? undefined,
          type: e.type,
          distanceKm: (e.distanceKm as number) ?? undefined,
          standCost: (e.standCost as number) ?? undefined,
          applicationDeadline: (e.applicationDeadline as string) ?? undefined,
          url: (e.url as string) ?? undefined,
          source: (e.source as string) ?? undefined,
          notes: (e.notes as string) ?? undefined,
          status: 'propose',
        });
      }
      await save('events', fresh);
      await observe('events_search', { found: res.events.length, added: fresh.length });
      toast(fresh.length ? `${fresh.length} nouvel(s) événement(s) trouvé(s)` : 'Rien de nouveau pour l’instant');
    });

  const setStatus = async (e: MarketEvent, status: MarketEvent['status']) => {
    await save('events', { ...e, status });
    await observe('event_status', { id: e.id, status });
    setDetail(null);
  };

  const prepareApplication = (e: MarketEvent) =>
    run('app', async () => {
      const draft = await callAgent<{ subject: string; letter: string; presentation: string; dossier: string[]; photoAdvice: string[] }>('application', {
        event: e,
        profile: s.profile,
        products: s.products.map((p) => ({ name: p.name, category: p.category, price: p.price })),
        knowledge: s.eventResults.filter((r) => r.seriesKey === e.seriesKey),
      });
      const a: Approval = {
        id: newId(), updatedAt: Date.now(), kind: 'candidature', title: `Candidature · ${e.name}`,
        summary: 'Lettre, présentation et dossier prêts à relire.', payload: { ...draft, eventId: e.id },
        status: 'en_attente', createdAt: Date.now(),
      };
      await save('approvals', a);
      if (e.status === 'propose') await save('events', { ...e, status: 'interesse' });
      setDetail(null);
      toast('Candidature prête : relis-la en haut de la page.');
    });

  return (
    <>
      <button className="btn primary block" disabled={!!busy} onClick={search}>
        {busy === 'search' ? '🔎 Je cherche sur internet…' : '🔎 Chercher des événements'}
      </button>
      {toReview.map((e) => (
        <button key={e.id} className="banner" style={{ textAlign: 'left' }} onClick={() => setBilan(e)}>
          <span style={{ fontSize: 28 }}>📝</span>
          <span className="grow">Comment s'est passé <strong>{e.name}</strong> ? (30 s)</span>
        </button>
      ))}
      {ranked.length === 0 && <Empty emoji="🗺️">Aucun événement à venir. Lance une recherche !</Empty>}
      <div className="stack">
        {ranked.map((r) => (
          <button key={r.event.id} className="card stack" style={{ textAlign: 'left' }} onClick={() => setDetail(r)}>
            <div className="row">
              <span className={`pill ${r.tier}`}>{TIER[r.tier]}</span>
              {r.event.status === 'inscrit' && <span className="pill ok">Inscrit</span>}
              {r.event.status === 'candidature' && <span className="pill ok">Candidature envoyée</span>}
            </div>
            <div style={{ fontWeight: 800, fontSize: 21 }}>{r.event.name}</div>
            <div className="muted small">{frDate(r.event.date)} · {r.event.city}{r.event.distanceKm != null ? ` · ${r.event.distanceKm} km` : ''}</div>
            <div className="small">{r.blockers[0] ?? r.reasons[0]}</div>
          </button>
        ))}
      </div>
      <History s={s} />

      {detail && (
        <Modal onClose={() => setDetail(null)}>
          <span className={`pill ${detail.tier}`} style={{ alignSelf: 'flex-start' }}>{TIER[detail.tier]}</span>
          <div className="big-q">{detail.event.name}</div>
          <div className="muted">{frDate(detail.event.date)} · {detail.event.city}</div>
          <div className="card stack">
            <strong>Pourquoi</strong>
            {[...detail.blockers.map((b) => `⚠️ ${b}`), ...detail.reasons].map((x, i) => <div key={i}>{x}</div>)}
          </div>
          {detail.event.notes && <div className="small">{detail.event.notes}</div>}
          {detail.event.url && <a className="link" href={detail.event.url} target="_blank" rel="noopener">🔗 Voir la page de l'événement</a>}
          {detail.event.status !== 'inscrit' && (
            <button className="btn primary" disabled={!!busy} onClick={() => prepareApplication(detail.event)}>
              {busy === 'app' ? '✍️ J’écris…' : '✍️ Préparer la candidature'}
            </button>
          )}
          <div className="row">
            {detail.event.status !== 'inscrit' && <button className="btn go grow" onClick={() => setStatus(detail.event, 'inscrit')}>✓ Je suis inscrit</button>}
            <button className="btn grow" onClick={() => setStatus(detail.event, 'ignore')}>Pas pour moi</button>
          </div>
        </Modal>
      )}
      {bilan && <Bilan s={s} event={bilan} onClose={() => setBilan(null)} />}
    </>
  );
}

function History({ s }: { s: Snapshot }) {
  const series = new Map<string, EventResult[]>();
  for (const r of s.eventResults) series.set(r.seriesKey, [...(series.get(r.seriesKey) ?? []), r]);
  if (!series.size) return null;
  return (
    <div className="stack">
      <strong>Mémoire des années passées</strong>
      {[...series.values()].map((rs) => {
        const sorted = rs.sort((a, b) => a.date.localeCompare(b.date));
        return (
          <div key={sorted[0].seriesKey} className="card">
            <div style={{ fontWeight: 800 }}>{sorted[0].name}</div>
            <div className="row small" style={{ flexWrap: 'wrap', gap: 14 }}>
              {sorted.map((r) => (
                <span key={r.id}>{r.date.slice(0, 4)} : <strong>{euros(r.revenue)}</strong> <span className="muted">(net {euros(r.revenue - r.cost)})</span></span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Bilan après événement : ce qui alimente l'apprentissage. */
function Bilan({ s, event, onClose }: { s: Snapshot; event: MarketEvent; onClose: () => void }) {
  const toast = useToast();
  const [revenue, setRevenue] = useState('');
  const [cost, setCost] = useState(String(event.standCost ?? ''));
  const [hours, setHours] = useState('');
  const [comment, setComment] = useState('');
  const [sold, setSold] = useState<Record<string, number>>({});

  async function saveIt() {
    const productsSold = Object.entries(sold).filter(([, q]) => q > 0).map(([productId, qty]) => ({ productId, qty }));
    const soldValue = productsSold.reduce((a, x) => a + x.qty * (s.products.find((p) => p.id === x.productId)?.price ?? 0), 0);
    const rev = revenue ? Number(revenue.replace(',', '.')) : soldValue;
    const r: EventResult = {
      id: newId(), updatedAt: Date.now(), eventId: event.id, seriesKey: event.seriesKey, name: event.name, date: event.date,
      cost: Number(cost.replace(',', '.')) || 0, revenue: rev, productsSold, comment, hoursOnSite: Number(hours) || undefined, distanceKm: event.distanceKm,
    };
    await save('eventResults', r);
    await save('sales', productsSold.map((x) => ({
      id: newId(), updatedAt: Date.now(), date: event.date, productId: x.productId, qty: x.qty,
      unitPrice: s.products.find((p) => p.id === x.productId)?.price ?? 0, channel: 'marche' as const, eventId: event.id,
    })));
    await save('products', productsSold.flatMap((x) => {
      const p = s.products.find((pp) => pp.id === x.productId);
      return p ? [{ ...p, stock: Math.max(0, p.stock - x.qty) }] : [];
    }));
    await save('events', { ...event, status: 'passe' });
    await observe('event_result', { seriesKey: event.seriesKey, revenue: rev });
    toast('Merci ! Je m’en souviendrai l’an prochain.');
    onClose();
  }

  return (
    <Modal onClose={onClose}>
      <div className="big-q">{event.name}</div>
      <strong>Qu'as-tu vendu ?</strong>
      {s.products.map((p) => (
        <div key={p.id} className="line">
          <div className="grow name">{p.emoji} {p.name}</div>
          <button className="pm" onClick={() => setSold({ ...sold, [p.id]: Math.max(0, (sold[p.id] ?? 0) - 1) })}>−</button>
          <div className="qty-big">{sold[p.id] ?? 0}</div>
          <button className="pm" onClick={() => setSold({ ...sold, [p.id]: (sold[p.id] ?? 0) + 1 })}>+</button>
        </div>
      ))}
      <div className="two">
        <Field label="Chiffre d'affaires (€)"><input inputMode="decimal" value={revenue} placeholder="calculé si vide" onChange={(e) => setRevenue(e.target.value)} /></Field>
        <Field label="Coût total (€)"><input inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} /></Field>
      </div>
      <Field label="Heures sur place"><input inputMode="decimal" value={hours} onChange={(e) => setHours(e.target.value)} /></Field>
      <Field label="Un commentaire ?"><textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Affluence, météo, emplacement…" /></Field>
      <button className="btn go huge" onClick={saveIt}>ENREGISTRER</button>
    </Modal>
  );
}

// ------------------------------------------------------------------ Publications

function Publications({ s }: { s: Snapshot }) {
  const media = useRows('media');
  const { busy, run } = useBusy();
  const toast = useToast();

  const analyze = (file: File) =>
    run('media', async () => {
      const isVideo = file.type.startsWith('video/');
      const frames = isVideo ? await videoKeyframes(file) : [{ at: null, dataUrl: await imageToDataUrl(file) }];
      const res = await callAgent<{ summary: string; ideas: Omit<MediaIdea, 'id' | 'updatedAt' | 'createdAt' | 'sourceName' | 'status'>[] }>('media', {
        name: file.name, kind: isVideo ? 'video' : 'photo', frames, profile: s.profile,
      });
      await save('media', res.ideas.map((i) => ({ ...i, id: newId(), updatedAt: Date.now(), createdAt: Date.now(), sourceName: file.name, status: 'idee' as const })));
      await observe('media_analyzed', { name: file.name, ideas: res.ideas.length });
      toast(`${res.ideas.length} idée(s) de publication`);
    });

  async function propose(m: MediaIdea) {
    const a: Approval = {
      id: newId(), updatedAt: Date.now(), kind: 'publication', title: `${m.format.toUpperCase()} · ${m.title}`,
      summary: `Depuis ${m.sourceName}`, payload: { caption: `${m.caption}\n\n${m.hashtags.join(' ')}`, hashtags: m.hashtags, mediaId: m.id },
      status: 'en_attente', createdAt: Date.now(),
    };
    await save('approvals', a);
    await save('media', { ...m, status: 'en_validation' });
    toast('À relire en haut de la page.');
  }

  const ideas = (media ?? []).filter((m) => m.status === 'idee').sort((a, b) => b.createdAt - a.createdAt);
  return (
    <>
      <label className="btn primary block" style={{ cursor: 'pointer' }}>
        {busy ? '👀 Je regarde…' : '🎬 Analyser une vidéo ou une photo'}
        <input type="file" accept="video/*,image/*" hidden disabled={!!busy} onChange={(e) => e.target.files?.[0] && analyze(e.target.files[0])} />
      </label>
      <p className="muted small">J'extrais quelques images sur ton appareil, je repère les gestes et les produits finis, et je propose des reels / posts. Rien n'est publié sans ta validation.</p>
      {ideas.length === 0 && <Empty emoji="🎞️">Filme ton atelier, je trouve les meilleurs moments.</Empty>}
      <div className="stack">
        {ideas.map((m) => (
          <div key={m.id} className="card stack">
            <div className="row"><span className="pill interessant">{m.format}</span><strong className="grow">{m.title}</strong></div>
            <div className="small">{m.caption}</div>
            {m.moments.length > 0 && (
              <ul className="small muted" style={{ margin: 0 }}>
                {m.moments.map((x, i) => <li key={i}>{x.at != null ? `${Math.round(x.at)} s — ` : ''}{x.description}</li>)}
              </ul>
            )}
            <div className="row">
              <button className="btn grow" onClick={() => save('media', { ...m, status: 'rejete' })}>Bof</button>
              <button className="btn primary grow" onClick={() => propose(m)}>Proposer</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
