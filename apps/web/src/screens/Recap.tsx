import { buildRecap, formatMinutes } from '@boss/core';
import { Bar } from '../components/ui.tsx';
import { euros, frDate, useSnapshot } from '../lib/hooks.ts';

/** RÉCAP : huit informations, aucun tableau. */
export default function Recap() {
  const s = useSnapshot();
  if (!s) return null;
  const r = buildRecap(s);
  return (
    <>
      <Bar title="RÉCAP" />
      {r.alert && (
        <div className="kpi wide alert">
          <div className="k">⚠️ Important</div>
          <div className="v s">{r.alert}</div>
        </div>
      )}
      <div className="kpis">
        <div className="kpi wide">
          <div className="k">Chiffre d'affaires du mois</div>
          <div className="v">{euros(r.revenue)}</div>
          {r.goal > 0 && (
            <>
              <div className="progress" style={{ marginTop: 10 }}><div style={{ width: `${Math.min(100, r.progress)}%` }} /></div>
              <div className="small muted" style={{ marginTop: 6 }}>{r.progress} % de l'objectif ({euros(r.goal)})</div>
            </>
          )}
        </div>
        <div className="kpi">
          <div className="k">Le plus vendu</div>
          <div className="v s">{r.bestProduct ? `${r.bestProduct.name} ×${r.bestProduct.qty}` : '—'}</div>
        </div>
        <div className="kpi">
          <div className="k">Temps atelier</div>
          <div className="v s">{formatMinutes(r.workshopMinutes)}</div>
        </div>
        <div className="kpi wide">
          <div className="k">Commande urgente</div>
          <div className="v s">{r.urgentOrder ? `${r.urgentOrder.client}${r.urgentOrder.dueDate ? ` · ${frDate(r.urgentOrder.dueDate)}` : ''}` : 'Aucune 👌'}</div>
        </div>
        <div className="kpi wide">
          <div className="k">Prochain événement</div>
          <div className="v s">{r.nextEvent ? `${r.nextEvent.name} · dans ${r.nextEvent.inDays} j` : '—'}</div>
        </div>
      </div>
    </>
  );
}
