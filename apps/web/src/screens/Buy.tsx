/**
 * À ACHETER : l'IA surveille, recommande, compare. L'humain valide toujours.
 * Parcours : suggestion → "Valider l'achat" (approbation) → page fournisseur → "Reçu" (stock +).
 */
import { useState } from 'react';
import { newId, purchaseSuggestions, type Approval, type PurchaseSuggestion } from '@boss/core';
import { Bar, Empty, Modal, useBusy, useToast } from '../components/ui.tsx';
import { callAgent, executeAction } from '../lib/api.ts';
import { observe, save } from '../lib/db.ts';
import { euros, useRows, useSnapshot } from '../lib/hooks.ts';
import { syncNow } from '../lib/sync.ts';

interface Offers {
  offers: { supplier: string; product: string; url: string | null; price: number | null; packSize: number | null; unitPrice: number | null; shipping: string | null; note: string; isAlternative: boolean }[];
  advice: string;
}

const URG = { rupture: 'Urgent', bientot: 'Bientôt', prevoir: 'À prévoir' };

export default function Buy() {
  const s = useSnapshot();
  const approvals = useRows('approvals');
  const toast = useToast();
  const { busy, run } = useBusy();
  const [validate, setValidate] = useState<PurchaseSuggestion | null>(null);
  const [qty, setQty] = useState(0);
  const [offers, setOffers] = useState<{ s: PurchaseSuggestion; o: Offers } | null>(null);
  if (!s || !approvals) return null;

  const sug = purchaseSuggestions(s);
  const ordered = approvals.filter((a) => a.kind === 'achat' && (a.status === 'approuve' || a.status === 'execute'));
  const orderedIds = new Set(ordered.map((a) => a.payload.itemId as string));
  const total = sug.filter((x) => !orderedIds.has(x.itemId)).reduce((a, x) => a + (x.budget ?? 0), 0);

  async function approve(x: PurchaseSuggestion, quantity: number) {
    const it = s!.items.find((i) => i.id === x.itemId);
    const a: Approval = {
      id: newId(),
      updatedAt: Date.now(),
      kind: 'achat',
      title: `${quantity} ${x.unit} de ${x.name}`,
      summary: x.reasons.join(' · '),
      amount: it?.unitCost != null ? Math.round(quantity * it.unitCost * 100) / 100 : undefined,
      payload: { itemId: x.itemId, quantity, supplierUrl: x.supplierUrl, supplierName: x.supplierName },
      status: 'approuve', // décision humaine explicite : c'est ce bouton qui la porte
      createdAt: Date.now(),
      decidedAt: Date.now(),
    };
    await save('approvals', a);
    await observe('purchase_approved', { itemId: x.itemId, quantity });
    setValidate(null);
    if (x.supplierUrl) window.open(x.supplierUrl, '_blank', 'noopener');
    toast('Validé. Je t’ouvre le fournisseur, tu paies toi-même.');
    syncNow().then(() => executeAction(a.id).catch(() => undefined));
  }

  async function received(a: Approval) {
    const it = s!.items.find((i) => i.id === a.payload.itemId);
    if (it) await save('items', { ...it, stock: it.stock + Number(a.payload.quantity ?? 0) });
    await save('approvals', { ...a, status: 'execute' as const, payload: { ...a.payload, receivedAt: Date.now() } });
    await observe('purchase_received', { itemId: a.payload.itemId });
    toast('Rangé dans le stock ✓');
  }

  const waiting = ordered.filter((a) => a.status === 'approuve');

  return (
    <>
      <Bar title="À ACHETER" />
      {waiting.length > 0 && (
        <div className="stack">
          <strong>En commande</strong>
          {waiting.map((a) => (
            <div key={a.id} className="line">
              <div className="grow">
                <div className="name">{a.title}</div>
                {a.amount != null && <div className="small muted">{euros(a.amount)}</div>}
              </div>
              <button className="btn go" onClick={() => received(a)}>📬 Reçu</button>
            </div>
          ))}
        </div>
      )}
      {sug.length === 0 ? (
        <Empty emoji="👌">Rien à acheter pour l'instant. Je surveille.</Empty>
      ) : (
        <>
          <div className="muted">Budget estimé : <strong>{euros(total)}</strong></div>
          <div className="stack">
            {sug.filter((x) => !orderedIds.has(x.itemId)).map((x) => (
              <div key={x.itemId} className="card stack">
                <div className="row">
                  <div className="grow">
                    <div className="name" style={{ fontWeight: 800, fontSize: 21 }}>{x.name}</div>
                    <div className="small muted">{x.reasons.join(' · ')}</div>
                  </div>
                  <span className={`pill ${x.urgency}`}>{URG[x.urgency]}</span>
                </div>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <div><div className="small muted">J'ai</div><strong style={{ fontSize: 22 }}>{x.current} {x.unit !== 'pièce' && x.unit}</strong></div>
                  <div><div className="small muted">Acheter</div><strong style={{ fontSize: 22 }}>{x.recommended} {x.unit !== 'pièce' && x.unit}</strong></div>
                  <div><div className="small muted">Budget</div><strong style={{ fontSize: 22 }}>{x.budget != null ? euros(x.budget) : '—'}</strong></div>
                </div>
                {x.supplierUrl && (
                  <a className="link small" href={x.supplierUrl} target="_blank" rel="noopener">🔗 {x.supplierName ?? 'Fournisseur'}</a>
                )}
                <div className="row">
                  <button className="btn grow" disabled={!!busy} onClick={() => run('offers', async () => setOffers({ s: x, o: await callAgent<Offers>('suppliers', { item: s.items.find((i) => i.id === x.itemId), quantity: x.recommended }) }))}>
                    {busy ? '🔎 Je compare…' : '🔎 Mieux ailleurs ?'}
                  </button>
                  <button className="btn primary grow" onClick={() => (setValidate(x), setQty(x.recommended))}>Valider l'achat</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {validate && (
        <Modal onClose={() => setValidate(null)}>
          <div className="big-q">Acheter {validate.name} ?</div>
          <div className="row" style={{ justifyContent: 'center' }}>
            <button className="pm" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
            <div className="qty-big" style={{ fontSize: 40 }}>{qty}</div>
            <button className="pm" onClick={() => setQty(qty + 1)}>+</button>
          </div>
          <p className="muted">Rien n'est payé automatiquement. En validant, j'ouvre la page du fournisseur et je note la commande.</p>
          <button className="btn go huge" onClick={() => approve(validate, qty)}>OUI, JE VALIDE</button>
          <button className="btn" onClick={() => setValidate(null)}>Non</button>
        </Modal>
      )}

      {offers && (
        <Modal onClose={() => setOffers(null)}>
          <div className="big-q">{offers.s.name} : les offres</div>
          <div className="reason">{offers.o.advice}</div>
          {offers.o.offers.map((o, i) => (
            <div key={i} className="card stack">
              <div className="row">
                <strong className="grow">{o.supplier}</strong>
                {o.isAlternative && <span className="pill interessant">alternative</span>}
              </div>
              <div className="small">{o.product}</div>
              <div className="row small muted">
                {o.price != null && <span>{euros(o.price)}{o.packSize ? ` / ${o.packSize}` : ''}</span>}
                {o.shipping && <span>· {o.shipping}</span>}
              </div>
              <div className="small">{o.note}</div>
              {o.url && <a className="link" href={o.url} target="_blank" rel="noopener">Voir l'offre</a>}
            </div>
          ))}
          <button className="btn" onClick={() => setOffers(null)}>Fermer</button>
        </Modal>
      )}
    </>
  );
}
