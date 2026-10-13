/**
 * STOCK : − / + en attente, puis VALIDER LES CHANGEMENTS avec résumé.
 * Une baisse de produit fini est proposée comme "vente" (mémoire des ventes sans saisie).
 */
import { useState } from 'react';
import { applyStockDeltas, type StockDelta } from '@boss/core';
import { Bar, Empty, Modal, useToast } from '../components/ui.tsx';
import { observe, save } from '../lib/db.ts';
import { useSnapshot } from '../lib/hooks.ts';

type Tab = 'produits' | 'composant' | 'consommable';

export default function Stock() {
  const s = useSnapshot();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('produits');
  const [pending, setPending] = useState<Record<string, number>>({});
  const [notSale, setNotSale] = useState<Record<string, boolean>>({});
  const [confirm, setConfirm] = useState(false);
  if (!s) return null;

  const rows =
    tab === 'produits'
      ? s.products.map((p) => ({ key: `products:${p.id}`, name: `${p.emoji ?? ''} ${p.name}`.trim(), qty: p.stock, unit: '', low: p.stock < p.minStock }))
      : s.items.filter((i) => i.kind === tab).map((i) => ({ key: `items:${i.id}`, name: i.name, qty: i.stock, unit: i.unit === 'pièce' ? '' : i.unit, low: i.stock < i.minStock }));
  const changes = Object.entries(pending).filter(([, d]) => d !== 0);
  const bump = (k: string, d: number, cur: number) =>
    setPending((p) => {
      const next = (p[k] ?? 0) + d;
      return { ...p, [k]: cur + next < 0 ? -cur : next };
    });
  const label = (k: string) => {
    const [t, id] = k.split(':');
    return t === 'products' ? s.products.find((p) => p.id === id)?.name : s.items.find((i) => i.id === id)?.name;
  };
  const current = (k: string) => {
    const [t, id] = k.split(':');
    return (t === 'products' ? s.products.find((p) => p.id === id)?.stock : s.items.find((i) => i.id === id)?.stock) ?? 0;
  };

  async function validate() {
    const deltas: StockDelta[] = changes.map(([k, delta]) => {
      const [table, id] = k.split(':') as ['products' | 'items', string];
      return { table, id, delta, isSale: table === 'products' && delta < 0 && !notSale[k] };
    });
    const ch = applyStockDeltas(s!, deltas);
    await save('products', ch.products);
    await save('items', ch.items);
    await save('sales', ch.sales);
    await observe('stock_validated', { deltas });
    setPending({});
    setNotSale({});
    setConfirm(false);
    toast(ch.sales.length ? `Stock à jour · ${ch.sales.reduce((a, x) => a + x.qty, 0)} vente(s) notée(s)` : 'Stock à jour');
  }

  return (
    <>
      <Bar title="STOCK" />
      <div className="seg">
        {([['produits', 'Produits'], ['composant', 'Composants'], ['consommable', 'Consommables']] as const).map(([k, l]) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      <div className="stack">
        {rows.length === 0 && <Empty emoji="📭">Rien ici. Ajoute-les dans Réglages ⚙️.</Empty>}
        {rows.map((r) => {
          const d = pending[r.key] ?? 0;
          return (
            <div key={r.key} className={`line ${d ? 'changed' : ''}`}>
              <div className="grow">
                <div className="name">{r.name}</div>
                {r.low && <span className="pill rupture">bas</span>}
              </div>
              <button className="pm" aria-label="moins" onClick={() => bump(r.key, -1, r.qty)}>−</button>
              <div className="qty-big">
                {fmt(r.qty + d)}
                {r.unit && <div className="small muted">{r.unit}</div>}
                {d !== 0 && <div className={`delta ${d < 0 ? 'neg' : ''}`}>{d > 0 ? `+${fmt(d)}` : fmt(d)}</div>}
              </div>
              <button className="pm" aria-label="plus" onClick={() => bump(r.key, 1, r.qty)}>+</button>
            </div>
          );
        })}
      </div>
      {changes.length > 0 && (
        <div className="sticky-bottom">
          <button className="btn go huge block" onClick={() => setConfirm(true)}>VALIDER LES CHANGEMENTS ({changes.length})</button>
        </div>
      )}
      {confirm && (
        <Modal onClose={() => setConfirm(false)}>
          <div className="big-q">Je valide ?</div>
          <div className="stack">
            {changes.map(([k, d]) => (
              <div key={k} className="card">
                <div className="row">
                  <strong className="grow">{label(k)}</strong>
                  <span>{fmt(current(k))} → <strong>{fmt(current(k) + d)}</strong></span>
                </div>
                {k.startsWith('products:') && d < 0 && (
                  <div className="row" style={{ marginTop: 10 }}>
                    <button className={`btn grow ${!notSale[k] ? 'primary' : ''}`} onClick={() => setNotSale({ ...notSale, [k]: false })}>💶 Vendu</button>
                    <button className={`btn grow ${notSale[k] ? 'primary' : ''}`} onClick={() => setNotSale({ ...notSale, [k]: true })}>Autre (casse, don…)</button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="muted small">Je mets aussi à jour les prévisions, les achats et la planification.</p>
          <button className="btn go huge" onClick={validate}>OUI, VALIDER</button>
          <button className="btn" onClick={() => setConfirm(false)}>Revenir</button>
        </Modal>
      )}
    </>
  );
}

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', ','));
