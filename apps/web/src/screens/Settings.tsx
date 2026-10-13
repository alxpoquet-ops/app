/**
 * RÉGLAGES : tout ce qui est avancé est caché ici.
 * Produits, fournitures, commandes clients, profil, comptes, validations, mémoire, synchro.
 */
import { useEffect, useState, type ReactNode } from 'react';
import {
  averageProductMinutes,
  formatMinutes,
  learn,
  newId,
  TABLES,
  type BomLine,
  type BusinessProfile,
  type CustomerOrder,
  type Item,
  type Product,
  type ProductStep,
  type StepKind,
  type TableName,
} from '@boss/core';
import { Bar, Empty, Field, useNav, useToast } from '../components/ui.tsx';
import { serverHealth } from '../lib/api.ts';
import { db, getSettings, observe, remove, save, setMeta } from '../lib/db.ts';
import { euros, frDate, useRows, useSnapshot } from '../lib/hooks.ts';
import { onSync, syncNow, type SyncState } from '../lib/sync.ts';

export default function Settings({ page, id }: { page?: string; id?: string }) {
  const nav = useNav();
  const go = (p?: string, i?: string) => nav({ name: 'settings', page: p, id: i });
  switch (page) {
    case 'products': return <ProductList go={go} />;
    case 'product': return <ProductEdit id={id!} back={() => go('products')} />;
    case 'items': return <ItemList go={go} />;
    case 'item': return <ItemEdit id={id!} back={() => go('items')} />;
    case 'orders': return <OrderList go={go} />;
    case 'order': return <OrderEdit id={id!} back={() => go('orders')} />;
    case 'profile': return <ProfileEdit back={() => go()} />;
    case 'accounts': return <Accounts back={() => go()} />;
    case 'approvals': return <Approvals back={() => go()} />;
    case 'memory': return <Memory back={() => go()} />;
    case 'server': return <Server back={() => go()} />;
  }
  return (
    <>
      <Bar title="Réglages" />
      <div className="menu">
        <MenuItem e="🌹" l="Mes produits" onClick={() => go('products')} />
        <MenuItem e="🧵" l="Composants & consommables" onClick={() => go('items')} />
        <MenuItem e="🧾" l="Commandes clients" onClick={() => go('orders')} />
        <MenuItem e="🏠" l="Mon entreprise" onClick={() => go('profile')} />
        <MenuItem e="🔗" l="Comptes" onClick={() => go('accounts')} />
        <MenuItem e="✅" l="Historique des validations" onClick={() => go('approvals')} />
        <MenuItem e="🧠" l="Ce que j'ai appris" onClick={() => go('memory')} />
        <MenuItem e="☁️" l="Synchronisation & IA" onClick={() => go('server')} />
      </div>
    </>
  );
}

const MenuItem = ({ e, l, n, onClick }: { e: string; l: string; n?: ReactNode; onClick: () => void }) => (
  <button onClick={onClick}><span className="e">{e}</span>{l}{n != null && <span className="n">{n}</span>}</button>
);
const num = (v: string) => Number(v.replace(',', '.')) || 0;

// ------------------------------------------------------------------ Produits

function ProductList({ go }: { go: (p?: string, i?: string) => void }) {
  const s = useSnapshot();
  if (!s) return null;
  return (
    <>
      <Bar title="Mes produits" back={() => go()} />
      <button className="btn primary block" onClick={() => go('product', 'new')}>+ Nouveau produit</button>
      {s.products.length === 0 && <Empty emoji="🌱">Ajoute ton premier produit.</Empty>}
      <div className="menu">
        {s.products.map((p) => (
          <MenuItem key={p.id} e={p.emoji ?? '📦'} l={p.name} n={`${euros(p.price)} · ${formatMinutes(averageProductMinutes(p, s.timeLogs))}`} onClick={() => go('product', p.id)} />
        ))}
      </div>
    </>
  );
}

const KINDS: [StepKind, string][] = [
  ['fabrication', 'Fabrication'], ['assemblage', 'Assemblage'], ['controle', 'Contrôle qualité'],
  ['photo', 'Photo'], ['emballage', 'Emballage'], ['preparation', 'Préparation'], ['rangement', 'Rangement'],
];

function ProductEdit({ id, back }: { id: string; back: () => void }) {
  const s = useSnapshot();
  const toast = useToast();
  const [p, setP] = useState<Product | null>(null);
  useEffect(() => {
    if (!s || p) return;
    setP(
      s.products.find((x) => x.id === id) ?? {
        id: newId(), updatedAt: 0, name: '', category: '', price: 0, stock: 0, minStock: 0, mode: 'serie',
        components: [], consumables: [], tools: [], emoji: '✨',
        steps: [{ id: newId(), name: 'Fabrication', kind: 'fabrication', minutesPerUnit: 20 }],
      },
    );
  }, [s, id, p]);
  if (!s || !p) return null;
  const set = (patch: Partial<Product>) => setP({ ...p, ...patch });
  const setStep = (i: number, patch: Partial<ProductStep>) => set({ steps: p.steps.map((st, j) => (j === i ? { ...st, ...patch } : st)) });
  const isNew = !s.products.some((x) => x.id === id);

  const Bom = ({ field, kind }: { field: 'components' | 'consumables'; kind: Item['kind'] }) => {
    const lines: BomLine[] = p[field];
    const options = s.items.filter((i) => i.kind === kind);
    return (
      <div className="stack">
        {lines.map((l, i) => (
          <div key={i} className="row">
            <select className="grow" style={{ minHeight: 54, borderRadius: 14, border: '2px solid var(--line)', background: 'var(--card)', padding: '0 10px' }}
              value={l.itemId} onChange={(e) => set({ [field]: lines.map((x, j) => (j === i ? { ...x, itemId: e.target.value } : x)) } as Partial<Product>)}>
              {options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
            <input style={{ width: 90, minHeight: 54, borderRadius: 14, border: '2px solid var(--line)', background: 'var(--card)', padding: '0 10px' }} inputMode="decimal"
              defaultValue={l.qty} onBlur={(e) => set({ [field]: lines.map((x, j) => (j === i ? { ...x, qty: num(e.target.value) } : x)) } as Partial<Product>)} />
            <button className="pm" onClick={() => set({ [field]: lines.filter((_, j) => j !== i) } as Partial<Product>)}>×</button>
          </div>
        ))}
        {options.length > 0 ? (
          <button className="btn" onClick={() => set({ [field]: [...lines, { itemId: options[0].id, qty: 1 }] } as Partial<Product>)}>+ Ajouter</button>
        ) : <div className="small muted">Crée d'abord des {kind}s dans Réglages.</div>}
      </div>
    );
  };

  async function submit() {
    if (!p!.name) return toast('Il manque le nom');
    await save('products', p!);
    await observe(isNew ? 'product_created' : 'product_updated', { id: p!.id });
    back();
  }

  return (
    <>
      <Bar title={isNew ? 'Nouveau produit' : p.name} back={back} />
      <div className="two">
        <Field label="Nom"><input value={p.name} onChange={(e) => set({ name: e.target.value })} /></Field>
        <Field label="Emoji"><input value={p.emoji ?? ''} onChange={(e) => set({ emoji: e.target.value })} /></Field>
      </div>
      <div className="two">
        <Field label="Catégorie"><input value={p.category} onChange={(e) => set({ category: e.target.value })} /></Field>
        <Field label="Prix de vente (€) — c'est toi qui choisis"><input inputMode="decimal" defaultValue={p.price} onBlur={(e) => set({ price: num(e.target.value) })} /></Field>
      </div>
      <div className="two">
        <Field label="Stock"><input inputMode="numeric" defaultValue={p.stock} onBlur={(e) => set({ stock: num(e.target.value) })} /></Field>
        <Field label="Stock minimum"><input inputMode="numeric" defaultValue={p.minStock} onBlur={(e) => set({ minStock: num(e.target.value) })} /></Field>
      </div>
      <div className="seg">
        <button className={p.mode === 'serie' ? 'on' : ''} onClick={() => set({ mode: 'serie' })}>En série</button>
        <button className={p.mode === 'unitaire' ? 'on' : ''} onClick={() => set({ mode: 'unitaire' })}>À l'unité</button>
      </div>
      {!isNew && <div className="card">⏱ Temps moyen réel : <strong>{formatMinutes(averageProductMinutes(p, s.timeLogs))}</strong> par pièce</div>}
      <strong>Étapes (dans l'ordre)</strong>
      {p.steps.map((st, i) => (
        <div key={st.id} className="card stack">
          <div className="two">
            <Field label="Nom"><input value={st.name} onChange={(e) => setStep(i, { name: e.target.value })} /></Field>
            <Field label="Type">
              <select value={st.kind} onChange={(e) => setStep(i, { kind: e.target.value as StepKind })}>
                {KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </Field>
          </div>
          <div className="row">
            <Field label="Estimation de départ (min / pièce)"><input inputMode="decimal" defaultValue={st.minutesPerUnit} onBlur={(e) => setStep(i, { minutesPerUnit: num(e.target.value) })} /></Field>
            <button className="pm" style={{ alignSelf: 'flex-end' }} onClick={() => set({ steps: p.steps.filter((_, j) => j !== i) })}>×</button>
          </div>
        </div>
      ))}
      <button className="btn" onClick={() => set({ steps: [...p.steps, { id: newId(), name: '', kind: 'fabrication', minutesPerUnit: 10 }] })}>+ Étape</button>
      <strong>Composants (par pièce)</strong>
      <Bom field="components" kind="composant" />
      <strong>Consommables (par pièce)</strong>
      <Bom field="consumables" kind="consommable" />
      <Field label="Outils à préparer (un par ligne)">
        <textarea value={p.tools.join('\n')} onChange={(e) => set({ tools: e.target.value.split('\n') })} onBlur={() => set({ tools: p.tools.map((t) => t.trim()).filter(Boolean) })} />
      </Field>
      <button className="btn go huge" onClick={submit}>ENREGISTRER</button>
      {!isNew && <button className="btn" onClick={async () => (await remove('products', p.id), back())}>Supprimer ce produit</button>}
    </>
  );
}

// ------------------------------------------------------------------ Fournitures

function ItemList({ go }: { go: (p?: string, i?: string) => void }) {
  const items = useRows('items');
  if (!items) return null;
  return (
    <>
      <Bar title="Fournitures" back={() => go()} />
      <button className="btn primary block" onClick={() => go('item', 'new')}>+ Nouvelle fourniture</button>
      <div className="menu">
        {items.map((i) => (
          <MenuItem key={i.id} e={i.kind === 'composant' ? '🧵' : '🧴'} l={i.name} n={`${i.stock} ${i.unit}`} onClick={() => go('item', i.id)} />
        ))}
      </div>
    </>
  );
}

function ItemEdit({ id, back }: { id: string; back: () => void }) {
  const items = useRows('items');
  const [it, setIt] = useState<Item | null>(null);
  useEffect(() => {
    if (!items || it) return;
    setIt(items.find((x) => x.id === id) ?? { id: newId(), updatedAt: 0, name: '', kind: 'composant', unit: 'pièce', stock: 0, minStock: 0 });
  }, [items, id, it]);
  if (!it) return null;
  const set = (patch: Partial<Item>) => setIt({ ...it, ...patch });
  const isNew = !items!.some((x) => x.id === id);
  return (
    <>
      <Bar title={isNew ? 'Nouvelle fourniture' : it.name} back={back} />
      <Field label="Nom"><input value={it.name} onChange={(e) => set({ name: e.target.value })} /></Field>
      <div className="seg">
        <button className={it.kind === 'composant' ? 'on' : ''} onClick={() => set({ kind: 'composant' })}>Composant</button>
        <button className={it.kind === 'consommable' ? 'on' : ''} onClick={() => set({ kind: 'consommable' })}>Consommable</button>
      </div>
      <div className="two">
        <Field label="Unité"><input value={it.unit} onChange={(e) => set({ unit: e.target.value })} placeholder="pièce, m, g…" /></Field>
        <Field label="Conditionnement"><input inputMode="decimal" defaultValue={it.packSize ?? ''} onBlur={(e) => set({ packSize: num(e.target.value) || undefined })} /></Field>
      </div>
      <div className="two">
        <Field label="Stock"><input inputMode="decimal" defaultValue={it.stock} onBlur={(e) => set({ stock: num(e.target.value) })} /></Field>
        <Field label="Stock minimum"><input inputMode="decimal" defaultValue={it.minStock} onBlur={(e) => set({ minStock: num(e.target.value) })} /></Field>
      </div>
      <Field label="Coût unitaire (€)"><input inputMode="decimal" defaultValue={it.unitCost ?? ''} onBlur={(e) => set({ unitCost: num(e.target.value) || undefined })} /></Field>
      <div className="two">
        <Field label="Fournisseur"><input value={it.supplierName ?? ''} onChange={(e) => set({ supplierName: e.target.value })} /></Field>
        <Field label="Lien fournisseur"><input type="url" value={it.supplierUrl ?? ''} onChange={(e) => set({ supplierUrl: e.target.value })} /></Field>
      </div>
      <button className="btn go huge" disabled={!it.name} onClick={async () => (await save('items', it), back())}>ENREGISTRER</button>
      {!isNew && <button className="btn" onClick={async () => (await remove('items', it.id), back())}>Supprimer</button>}
    </>
  );
}

// ------------------------------------------------------------------ Commandes clients

const STATUS: Record<CustomerOrder['status'], string> = { nouvelle: 'Nouvelle', en_cours: 'En cours', prete: 'Prête', livree: 'Livrée', annulee: 'Annulée' };

function OrderList({ go }: { go: (p?: string, i?: string) => void }) {
  const orders = useRows('orders');
  if (!orders) return null;
  const sorted = [...orders].sort((a, b) => (a.status === 'livree' ? 1 : 0) - (b.status === 'livree' ? 1 : 0) || (a.dueDate ?? '9').localeCompare(b.dueDate ?? '9'));
  return (
    <>
      <Bar title="Commandes clients" back={() => go()} />
      <button className="btn primary block" onClick={() => go('order', 'new')}>+ Nouvelle commande</button>
      <p className="muted small">Je les intègre automatiquement dans À FAIRE, par ordre de priorité.</p>
      <div className="menu">
        {sorted.map((o) => (
          <MenuItem key={o.id} e={o.priority === 'urgente' ? '🔴' : o.priority === 'haute' ? '🟠' : '🟢'} l={o.client}
            n={`${STATUS[o.status]}${o.dueDate ? ' · ' + frDate(o.dueDate) : ''}`} onClick={() => go('order', o.id)} />
        ))}
      </div>
    </>
  );
}

function OrderEdit({ id, back }: { id: string; back: () => void }) {
  const s = useSnapshot();
  const [o, setO] = useState<CustomerOrder | null>(null);
  useEffect(() => {
    if (!s || o) return;
    setO(s.orders.find((x) => x.id === id) ?? {
      id: newId(), updatedAt: 0, client: '', description: '', quantity: 1, produced: 0, priority: 'normale', status: 'nouvelle', createdAt: Date.now(),
    });
  }, [s, id, o]);
  if (!s || !o) return null;
  const set = (patch: Partial<CustomerOrder>) => setO({ ...o, ...patch });
  const isNew = !s.orders.some((x) => x.id === id);
  async function submit() {
    await save('orders', o!);
    await observe(isNew ? 'order_created' : 'order_updated', { id: o!.id, priority: o!.priority });
    back();
  }
  return (
    <>
      <Bar title={isNew ? 'Nouvelle commande' : o.client} back={back} />
      <Field label="Client"><input value={o.client} onChange={(e) => set({ client: e.target.value })} /></Field>
      <div className="two">
        <Field label="Téléphone"><input type="tel" value={o.phone ?? ''} onChange={(e) => set({ phone: e.target.value })} /></Field>
        <Field label="Email"><input type="email" value={o.email ?? ''} onChange={(e) => set({ email: e.target.value })} /></Field>
      </div>
      <Field label="Description"><textarea value={o.description} onChange={(e) => set({ description: e.target.value })} /></Field>
      <div className="two">
        <Field label="Produit (si catalogue)">
          <select value={o.productId ?? ''} onChange={(e) => set({ productId: e.target.value || undefined })}>
            <option value="">Sur mesure</option>
            {s.products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="Quantité"><input inputMode="numeric" defaultValue={o.quantity} onBlur={(e) => set({ quantity: Math.max(1, num(e.target.value)) })} /></Field>
      </div>
      <Field label="Date souhaitée"><input type="date" value={o.dueDate ?? ''} onChange={(e) => set({ dueDate: e.target.value || undefined })} /></Field>
      <div className="two">
        <Field label="Budget (€)"><input inputMode="decimal" defaultValue={o.budget ?? ''} onBlur={(e) => set({ budget: num(e.target.value) || undefined })} /></Field>
        <Field label="Acompte (€)"><input inputMode="decimal" defaultValue={o.deposit ?? ''} onBlur={(e) => set({ deposit: num(e.target.value) || undefined })} /></Field>
      </div>
      <strong>Priorité</strong>
      <div className="seg">
        {(['normale', 'haute', 'urgente'] as const).map((p) => (
          <button key={p} className={o.priority === p ? 'on' : ''} onClick={() => set({ priority: p })}>{p[0].toUpperCase() + p.slice(1)}</button>
        ))}
      </div>
      {!isNew && (
        <>
          <strong>Statut</strong>
          <div className="seg" style={{ flexWrap: 'wrap' }}>
            {(Object.keys(STATUS) as CustomerOrder['status'][]).map((st) => (
              <button key={st} className={o.status === st ? 'on' : ''} onClick={() => set({ status: st })}>{STATUS[st]}</button>
            ))}
          </div>
        </>
      )}
      <button className="btn go huge" disabled={!o.client || !o.description} onClick={submit}>ENREGISTRER</button>
    </>
  );
}

// ------------------------------------------------------------------ Profil

function ProfileEdit({ back }: { back: () => void }) {
  const rows = useRows('profile');
  const [p, setP] = useState<BusinessProfile | null>(null);
  useEffect(() => { if (rows?.[0] && !p) setP(rows[0]); }, [rows, p]);
  if (!p) return null;
  const set = (patch: Partial<BusinessProfile>) => setP({ ...p, ...patch });
  const av = (k: keyof BusinessProfile['availability']) => (
    <button className={p.availability[k] ? 'on' : ''} onClick={() => set({ availability: { ...p.availability, [k]: !p.availability[k] } })}>
      {{ weekend: 'Week-end', semaine: 'Semaine', feries: 'Jours fériés' }[k]}
    </button>
  );
  return (
    <>
      <Bar title="Mon entreprise" back={back} />
      <Field label="Nom"><input value={p.businessName} onChange={(e) => set({ businessName: e.target.value })} /></Field>
      <Field label="Métier"><input value={p.craft} onChange={(e) => set({ craft: e.target.value })} /></Field>
      <strong>Type d'activité</strong>
      <div className="seg">
        {(['artisan', 'createur', 'revendeur', 'mixte'] as const).map((a) => (
          <button key={a} className={p.activity === a ? 'on' : ''} onClick={() => set({ activity: a })}>{a === 'createur' ? 'Créateur' : a[0].toUpperCase() + a.slice(1)}</button>
        ))}
      </div>
      <div className="two">
        <Field label="Ville"><input value={p.city} onChange={(e) => set({ city: e.target.value })} /></Field>
        <Field label="Distance max (km)"><input inputMode="numeric" defaultValue={p.maxDistanceKm} onBlur={(e) => set({ maxDistanceKm: num(e.target.value) })} /></Field>
      </div>
      <strong>Disponibilités pour les événements</strong>
      <div className="seg">{av('weekend')}{av('semaine')}{av('feries')}</div>
      <div className="two">
        <Field label="Événements max / mois"><input inputMode="numeric" defaultValue={p.maxEventsPerMonth} onBlur={(e) => set({ maxEventsPerMonth: num(e.target.value) })} /></Field>
        <Field label="Budget stand max (€)"><input inputMode="numeric" defaultValue={p.maxStandBudget} onBlur={(e) => set({ maxStandBudget: num(e.target.value) })} /></Field>
      </div>
      <Field label="Objectif CA mensuel (€)"><input inputMode="numeric" defaultValue={p.monthlyRevenueGoal} onBlur={(e) => set({ monthlyRevenueGoal: num(e.target.value) })} /></Field>
      <Field label="Objectifs commerciaux"><textarea value={p.commercialGoals ?? ''} onChange={(e) => set({ commercialGoals: e.target.value })} placeholder="Ex. vendre plus en ligne, se faire connaître à Reims…" /></Field>
      <Field label="Présentation (utilisée pour les candidatures)"><textarea value={p.presentation ?? ''} onChange={(e) => set({ presentation: e.target.value })} /></Field>
      <button className="btn go huge" onClick={async () => (await save('profile', p), back())}>ENREGISTRER</button>
    </>
  );
}

// ------------------------------------------------------------------ Comptes

const ACCOUNTS = [
  ['etsy', '🧶', 'Etsy'], ['instagram', '📸', 'Instagram'], ['facebook', '📘', 'Facebook'], ['tiktok', '🎵', 'TikTok'],
  ['pinterest', '📌', 'Pinterest'], ['gmail', '✉️', 'Gmail'], ['gcal', '📅', 'Google Agenda'], ['gdrive', '🗂️', 'Google Drive'],
  ['shopify', '🛍️', 'Boutique en ligne'], ['sumup', '💳', 'Terminal CB (SumUp…)'],
] as const;

function Accounts({ back }: { back: () => void }) {
  const rows = useRows('profile');
  const p = rows?.[0];
  if (!p) return null;
  const acc = p.accounts ?? {};
  const update = (k: string, v: { handle?: string; enabled: boolean }) => save('profile', { ...p, accounts: { ...acc, [k]: v } });
  return (
    <>
      <Bar title="Comptes" back={back} />
      <p className="muted small">
        Indique tes comptes : je m'en sers pour préparer candidatures et publications. Les envois automatiques
        se branchent sur le serveur (OAuth) et resteront toujours soumis à ta validation.
      </p>
      <div className="stack">
        {ACCOUNTS.map(([k, e, l]) => (
          <div key={k} className="line">
            <span style={{ fontSize: 28 }}>{e}</span>
            <div className="grow">
              <div className="name">{l}</div>
              <input placeholder="@identifiant ou e-mail" defaultValue={acc[k]?.handle ?? ''}
                style={{ width: '100%', minHeight: 44, border: 0, background: 'transparent', fontSize: 16 }}
                onBlur={(ev) => update(k, { handle: ev.target.value, enabled: !!ev.target.value })} />
            </div>
            {acc[k]?.enabled && <span className="pill ok">noté</span>}
          </div>
        ))}
      </div>
    </>
  );
}

// ------------------------------------------------------------------ Validations

function Approvals({ back }: { back: () => void }) {
  const list = useRows('approvals');
  if (!list) return null;
  const label = { en_attente: 'En attente', approuve: 'Validé', refuse: 'Refusé', execute: 'Fait' };
  return (
    <>
      <Bar title="Validations" back={back} />
      <p className="muted small">Tout ce qui engage de l'argent, une signature ou une publication passe par toi. Voici l'historique.</p>
      {list.length === 0 && <Empty emoji="🗒️">Rien pour l'instant.</Empty>}
      <div className="stack">
        {[...list].sort((a, b) => b.createdAt - a.createdAt).map((a) => (
          <div key={a.id} className="line">
            <div className="grow"><div className="name">{a.title}</div><div className="small muted">{new Date(a.createdAt).toLocaleDateString('fr-FR')}{a.amount != null ? ` · ${euros(a.amount)}` : ''}</div></div>
            <span className={`pill ${a.status === 'refuse' ? 'faible' : a.status === 'en_attente' ? 'interessant' : 'ok'}`}>{label[a.status]}</span>
          </div>
        ))}
      </div>
    </>
  );
}

// ------------------------------------------------------------------ Mémoire

function Memory({ back }: { back: () => void }) {
  const s = useSnapshot();
  const toast = useToast();
  if (!s) return null;
  const k = learn(s);
  async function exportAll() {
    const dump: Record<string, unknown[]> = {};
    for (const t of TABLES) dump[t] = await db.t(t).toArray();
    const url = URL.createObjectURL(new Blob([JSON.stringify(dump)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `boss-ia-sauvegarde-${s!.today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  async function importAll(f: File) {
    const dump = JSON.parse(await f.text()) as Record<string, unknown[]>;
    for (const t of TABLES) if (Array.isArray(dump[t])) await save(t as TableName, dump[t] as never);
    toast('Sauvegarde restaurée');
  }
  return (
    <>
      <Bar title="Ce que j'ai appris" back={back} />
      <div className="card stack">
        {k.usualSessionMinutes && <div>⏱ Tu travailles en général <strong>{formatMinutes(k.usualSessionMinutes)}</strong> par jour{k.usualStartHour != null ? `, à partir de ${k.usualStartHour} h` : ''}.</div>}
        {k.bestEnergy && <div>⚡ Tu es le plus productif quand tu te sens <strong>{{ fatigue: 'fatigué', normal: 'normal', motive: 'motivé' }[k.bestEnergy]}</strong>.</div>}
        {k.popularProducts.length > 0 && <div>🏆 Produits populaires : {k.popularProducts.map((p) => `${p.name} (${p.qty})`).join(', ')}.</div>}
        {k.bestEvents.length > 0 && <div>🎪 Événements les plus rentables : {k.bestEvents.map((e) => `${e.name} (~${euros(e.avgRevenue)} net)`).join(', ')}.</div>}
        <div>📈 Mois forts : {k.peakMonths.join(', ')}.</div>
        {k.productTimes.map((p) => <div key={p.name}>⏱ {p.name} : {formatMinutes(p.avgMinutes)} en moyenne.</div>)}
      </div>
      <p className="muted small">Je garde tout l'historique (temps, ventes, événements, décisions) pour mieux te conseiller.</p>
      <button className="btn block" onClick={exportAll}>💾 Télécharger une sauvegarde</button>
      <label className="btn block" style={{ cursor: 'pointer' }}>
        📂 Restaurer une sauvegarde
        <input type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importAll(e.target.files[0])} />
      </label>
    </>
  );
}

// ------------------------------------------------------------------ Serveur

function Server({ back }: { back: () => void }) {
  const toast = useToast();
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [sync, setSync] = useState<SyncState>({ status: 'off' });
  const [health, setHealth] = useState<{ ok: boolean; ai: boolean } | null | undefined>(undefined);
  useEffect(() => {
    getSettings().then((s) => (setUrl(s.serverUrl), setToken(s.token)));
    serverHealth().then(setHealth);
    return onSync(setSync);
  }, []);
  async function submit() {
    await setMeta('settings', { serverUrl: url.trim(), token: token.trim() });
    setHealth(await serverHealth());
    await syncNow();
    toast('Enregistré');
  }
  const label = { off: 'Désactivée', ok: 'À jour', pending: 'En attente de réseau', error: 'Erreur' }[sync.status];
  return (
    <>
      <Bar title="Synchronisation & IA" back={back} />
      <p className="muted small">Tes données vivent sur cet appareil et se synchronisent avec ton serveur BOSS IA pour retrouver tout sur PC, téléphone et tablette.</p>
      <Field label="Adresse du serveur (vide = même adresse que l'app)"><input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://boss.mon-atelier.fr" /></Field>
      <Field label="Jeton d'accès"><input type="password" value={token} onChange={(e) => setToken(e.target.value)} /></Field>
      <button className="btn go huge" onClick={submit}>ENREGISTRER</button>
      <div className="card stack">
        <div>☁️ Synchro : <strong>{label}</strong>{sync.lastSync ? ` · ${new Date(sync.lastSync).toLocaleTimeString('fr-FR')}` : ''}</div>
        {sync.message && <div className="small muted">{sync.message}</div>}
        <div>🤖 IA : <strong>{health === undefined ? '…' : health?.ai ? 'Disponible' : health ? 'Non configurée sur le serveur' : 'Serveur injoignable'}</strong></div>
      </div>
      <button className="btn block" onClick={() => syncNow()}>🔄 Synchroniser maintenant</button>
    </>
  );
}
