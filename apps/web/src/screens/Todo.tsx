/**
 * À FAIRE — le cœur du système.
 * 3 questions (temps, énergie, pauses) → l'IA construit la session → on produit.
 */
import { useEffect, useMemo, useState } from 'react';
import {
  buildDayPlan,
  completeBlock,
  formatMinutes,
  KIND_EMOJI,
  learn,
  type DayPlan,
  type Energy,
  type PlanBlock,
  type Snapshot,
} from '@boss/core';
import { Bar, Empty, useBusy, useNav, useToast } from '../components/ui.tsx';
import { callAgent } from '../lib/api.ts';
import { getMeta, observe, save, setMeta } from '../lib/db.ts';
import { useSnapshot } from '../lib/hooks.ts';

interface RunState {
  plan: DayPlan;
  energy: Energy;
  pauses: boolean;
  minutes: number;
  index: number;
  units: number;
  checks: number[];
  blockStartedAt: number;
  sessionStartedAt: number;
  lastPauseAt: number;
  pauseStartedAt?: number;
  done: { title: string; units: number; minutes: number }[];
}

const TIMES = [
  { m: 30, l: '30 min', e: '⏱️' },
  { m: 60, l: '1 heure', e: '🕐' },
  { m: 120, l: '2 heures', e: '🕑' },
  { m: 240, l: '4 heures', e: '🕓' },
  { m: 450, l: 'La journée', e: '☀️' },
];

export default function Todo() {
  const s = useSnapshot();
  const [run, setRunState] = useState<RunState | null | undefined>(undefined);
  useEffect(() => {
    getMeta<RunState | null>('session', null).then(setRunState);
  }, []);
  const setRun = (r: RunState | null) => {
    setRunState(r);
    setMeta('session', r);
  };

  if (!s || run === undefined) return null;
  if (run) return <Runner s={s} run={run} setRun={setRun} />;
  return <Wizard s={s} onStart={setRun} />;
}

// ------------------------------------------------------------------ Questions

function Wizard({ s, onStart }: { s: Snapshot; onStart: (r: RunState) => void }) {
  const nav = useNav();
  const [step, setStep] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [custom, setCustom] = useState('');
  const [energy, setEnergy] = useState<Energy>('normal');
  const [plan, setPlan] = useState<DayPlan | null>(null);
  const [pauses, setPauses] = useState(true);
  const usual = useMemo(() => learn(s).usualSessionMinutes, [s]);

  const back = step === 0 ? undefined : () => setStep(step - 1);

  if (step === 0)
    return (
      <>
        <Bar title="À FAIRE" back={back} />
        <div className="big-q">Combien de temps as-tu aujourd'hui ?</div>
        <div className="choices">
          {TIMES.map((t) => (
            <button key={t.m} className="choice" onClick={() => (setMinutes(t.m), setStep(1))}>
              <span className="e">{t.e}</span>
              {t.l}
              {usual && Math.abs(usual - t.m) < 20 && <div className="small muted">comme d'habitude</div>}
            </button>
          ))}
        </div>
        <div className="row">
          <input
            className="grow"
            style={{ minHeight: 64, borderRadius: 20, border: '2px solid var(--line)', padding: '0 16px', fontSize: 20, background: 'var(--card)' }}
            inputMode="decimal"
            placeholder="Autre (en heures, ex. 1,5)"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
          />
          <button
            className="btn primary"
            disabled={!(parseFloat(custom.replace(',', '.')) > 0)}
            onClick={() => (setMinutes(Math.round(parseFloat(custom.replace(',', '.')) * 60)), setStep(1))}
          >
            OK
          </button>
        </div>
        <button className="btn ghost" onClick={() => nav({ name: 'settings', page: 'order', id: 'new' })}>
          + Une cliente / un client m'a passé commande
        </button>
      </>
    );

  if (step === 1)
    return (
      <>
        <Bar title="À FAIRE" back={back} />
        <div className="big-q">Quel est ton niveau d'énergie ?</div>
        <div className="choices">
          {([
            ['fatigue', '😴', 'Fatigué'],
            ['normal', '🙂', 'Normal'],
            ['motive', '🔥', 'Motivé'],
          ] as const).map(([v, e, l]) => (
            <button key={v} className="choice" onClick={() => (setEnergy(v), setStep(2))}>
              <span className="e">{e}</span>
              {l}
            </button>
          ))}
        </div>
      </>
    );

  if (step === 2)
    return (
      <>
        <Bar title="À FAIRE" back={back} />
        <div className="big-q">Pauses automatiques conseillées ?</div>
        <div className="choices">
          {([
            [true, '☕', 'Oui'],
            [false, '🚫', 'Non'],
          ] as const).map(([v, e, l]) => (
            <button
              key={l}
              className="choice"
              onClick={() => {
                setPauses(v);
                setPlan(buildDayPlan(s, { availableMinutes: minutes, energy, pauses: v }));
                observe('session_request', { minutes, energy, pauses: v });
                setStep(3);
              }}
            >
              <span className="e">{e}</span>
              {l}
            </button>
          ))}
        </div>
      </>
    );

  return <PlanView plan={plan!} s={s} minutes={minutes} energy={energy} back={back!} onGo={() => {
    const now = Date.now();
    onStart({ plan: plan!, energy, pauses, minutes, index: 0, units: 0, checks: [], blockStartedAt: now, sessionStartedAt: now, lastPauseAt: now, done: [] });
    observe('session_start', { minutes, energy, blocks: plan!.blocks.length });
  }} />;
}

function PlanView({ plan, s, minutes, energy, back, onGo }: { plan: DayPlan; s: Snapshot; minutes: number; energy: Energy; back: () => void; onGo: () => void }) {
  const { busy, run } = useBusy();
  const [coach, setCoach] = useState<{ headline: string; why: string[]; encouragement: string } | null>(null);
  const products = new Map(s.products.map((p) => [p.id, p]));
  const askWhy = () =>
    run('coach', async () => {
      const brief = plan.blocks.map((b) => ({ kind: b.kind, title: b.title, step: b.subtitle, qty: b.target, min: Math.round(b.estMinutes), reason: b.reason }));
      setCoach(await callAgent('coach', { plan: { headline: plan.headline, why: plan.why, blocks: brief }, knowledge: learn(s), profile: s.profile, energy, minutes }));
    });

  return (
    <>
      <Bar title="Ta session" back={back} />
      <div className="card stack">
        <div className="headline">{coach?.headline ?? plan.headline}</div>
        <ul className="why" style={{ margin: 0, paddingLeft: 20 }}>
          {(coach?.why ?? plan.why).map((w, i) => <li key={i}>{w}</li>)}
        </ul>
        {coach && <div className="muted">{coach.encouragement}</div>}
        {!coach && plan.blocks.length > 0 && (
          <button className="btn ghost" disabled={!!busy} onClick={askWhy}>
            {busy ? 'Je réfléchis…' : '🗣️ Explique-moi avec tes mots'}
          </button>
        )}
      </div>
      {plan.blocks.length === 0 ? (
        <Empty emoji="🌿">Rien à produire. Repose-toi ou crée librement !</Empty>
      ) : (
        <ol className="plan-list">
          {plan.blocks.map((b) => (
            <li key={b.id} className={`plan-item ${b.kind === 'pause' ? 'pause' : ''}`}>
              <span className="e">{products.get(b.productId ?? '')?.emoji ?? KIND_EMOJI[b.kind]}</span>
              <div className="grow">
                <div className="t">{b.title}</div>
                <div className="small muted">{b.subtitle ?? b.reason}</div>
              </div>
              {b.target > 1 && <span className="qty">×{b.target}</span>}
              <span className="small muted">{formatMinutes(b.estMinutes)}</span>
            </li>
          ))}
        </ol>
      )}
      <div className="sticky-bottom">
        <button className="btn go huge block" disabled={!plan.blocks.length} onClick={onGo}>
          ▶ COMMENCER
        </button>
      </div>
    </>
  );
}

// ------------------------------------------------------------------ Production

function useTick(ms = 1000) {
  const [, set] = useState(0);
  useEffect(() => {
    const t = setInterval(() => set((x) => x + 1), ms);
    return () => clearInterval(t);
  }, [ms]);
}

function Runner({ s, run, setRun }: { s: Snapshot; run: RunState; setRun: (r: RunState | null) => void }) {
  useTick();
  const nav = useNav();
  const toast = useToast();
  const block: PlanBlock | undefined = run.plan.blocks[run.index];
  const product = block?.productId ? s.products.find((p) => p.id === block.productId) : undefined;
  const now = Date.now();
  const blockMin = (now - run.blockStartedAt) / 60000;

  async function persist(b: PlanBlock, units: number, minutes: number) {
    const ch = completeBlock(s, b, units, minutes, { energy: run.energy });
    await save('timeLogs', ch.timeLogs);
    await save('products', ch.products);
    await save('items', ch.items);
    await save('orders', ch.orders);
    return ch;
  }

  async function finishBlock(units: number, extra: Partial<RunState> = {}) {
    if (!block) return;
    const minutes = Math.max(0, Math.round(blockMin * 10) / 10);
    const ch = await persist(block, units, minutes);
    if (ch.orders.some((o) => o.status === 'prete')) toast(`🎉 Commande de ${ch.orders[0].client} prête !`);
    const done = block.kind === 'pause' ? run.done : [...run.done, { title: block.title + (block.subtitle ? ` · ${block.subtitle}` : ''), units, minutes }];
    const next = run.index + 1;
    setRun({ ...run, ...extra, index: next, units: 0, checks: [], blockStartedAt: Date.now(), done });
  }

  function tap() {
    if (!block) return;
    navigator.vibrate?.(30);
    const units = run.units + 1;
    if (units >= block.target) finishBlock(units);
    else setRun({ ...run, units });
  }

  async function stop() {
    if (block && block.kind !== 'pause' && (run.units > 0 || blockMin > 1)) await persist(block, run.units, Math.round(blockMin * 10) / 10);
    observe('session_end', { completed: run.index, total: run.plan.blocks.length, minutes: Math.round((now - run.sessionStartedAt) / 60000) });
    setRun(null);
    nav({ name: 'home' });
  }

  // Fin de session
  if (!block) {
    const total = Math.round((now - run.sessionStartedAt) / 60000);
    return (
      <>
        <Bar title="Bravo !" back={() => setRun(null)} />
        <div style={{ fontSize: 80, textAlign: 'center' }}>🎉</div>
        <div className="big-q" style={{ textAlign: 'center' }}>Session terminée</div>
        <div className="card stack">
          {run.done.map((d, i) => (
            <div key={i} className="row">
              <span className="grow">{d.title}</span>
              {d.units > 1 && <strong>×{d.units}</strong>}
            </div>
          ))}
          <div className="muted">Temps d'atelier : {formatMinutes(total)}</div>
        </div>
        <button className="btn primary huge" onClick={() => (observe('session_end', { completed: run.done.length, minutes: total }), setRun(null), nav({ name: 'home' }))}>
          TERMINER
        </button>
      </>
    );
  }

  const nextBlock = run.plan.blocks[run.index + 1];
  const header = (
    <div className="row">
      <button className="back" aria-label="Arrêter" onClick={stop}>✕</button>
      <div className="grow small muted" style={{ textAlign: 'center' }}>
        {run.index + 1} / {run.plan.blocks.length} · session {formatMinutes((now - run.sessionStartedAt) / 60000)}
      </div>
      <div style={{ width: 56 }} />
    </div>
  );

  // Pause conseillée
  if (block.kind === 'pause') {
    const inPause = run.pauseStartedAt != null;
    return (
      <>
        {header}
        <div className="prod">
          <div className="prod-title">
            <div className="e">☕</div>
            <h3>{block.title}</h3>
            <div className="sub">{block.reason}</div>
          </div>
          {inPause && <div className="elapsed">En pause depuis {formatMinutes((now - run.pauseStartedAt!) / 60000)}</div>}
          <div style={{ flex: 1 }} />
          {inPause ? (
            <button className="btn go huge" onClick={() => finishBlock(0, { pauseStartedAt: undefined, lastPauseAt: Date.now() })}>JE REPRENDS</button>
          ) : (
            <>
              <button className="btn primary huge" onClick={() => setRun({ ...run, pauseStartedAt: Date.now() })}>JE FAIS LA PAUSE</button>
              <button className="btn block" onClick={() => finishBlock(0)}>Pas besoin, je continue</button>
            </>
          )}
        </div>
      </>
    );
  }

  const longNoPause = run.pauses && now - run.lastPauseAt > 35 * 60000;

  // Préparation / checklist
  if (block.checklist?.length) {
    const all = block.checklist.length === run.checks.length;
    return (
      <>
        {header}
        <div className="prod">
          <div className="prod-title">
            <div className="e">{KIND_EMOJI[block.kind]}</div>
            <h3>{block.title}</h3>
          </div>
          <div className="checklist">
            {block.checklist.map((c, i) => {
              const on = run.checks.includes(i);
              return (
                <button key={i} className={`check ${on ? 'on' : ''}`} onClick={() => setRun({ ...run, checks: on ? run.checks.filter((x) => x !== i) : [...run.checks, i] })}>
                  <span className="box">{on ? '✓' : ''}</span>
                  {c}
                </button>
              );
            })}
          </div>
          <div className="elapsed">⏱ {formatMinutes(blockMin)}</div>
          <button className={`btn huge ${all ? 'go' : 'primary'}`} onClick={() => finishBlock(1)}>
            {block.kind === 'preparation' ? 'PRÉPARATION TERMINÉE' : 'TERMINÉ'}
          </button>
        </div>
      </>
    );
  }

  // Production en série / unitaire
  const pct = Math.round((run.units / block.target) * 100);
  return (
    <>
      {header}
      {longNoPause && (
        <div className="banner">
          <span style={{ fontSize: 28 }}>☕</span>
          <span className="grow">Ça fait plus de 30 min. Une mini pause ?</span>
          <button className="btn" onClick={() => setRun({ ...run, lastPauseAt: Date.now() })}>Plus tard</button>
        </div>
      )}
      <div className="prod">
        <div className="prod-title">
          <div className="e">{product?.emoji ?? KIND_EMOJI[block.kind]}</div>
          <h3>{block.title}</h3>
          {block.subtitle && <div className="sub">{block.subtitle}</div>}
        </div>
        <div className="small muted" style={{ textAlign: 'center' }}>Objectif : {block.target}</div>
        <div className="counter">
          {run.units} <small>/ {block.target}</small>
        </div>
        <div className="progress"><div style={{ width: `${pct}%` }} /></div>
        <div className="elapsed">⏱ {formatMinutes(blockMin)}</div>
        <div className="reason">{block.reason}</div>
        <div style={{ flex: 1 }} />
        {nextBlock && nextBlock.kind !== 'pause' && <div className="small muted" style={{ textAlign: 'center' }}>Ensuite : {nextBlock.title}{nextBlock.subtitle ? ` · ${nextBlock.subtitle}` : ''}</div>}
        <button className="btn go huge" onClick={tap}>✓ TERMINÉ</button>
        <div className="row">
          <button className="btn grow" disabled={run.units === 0} onClick={() => setRun({ ...run, units: run.units - 1 })}>↶ Annuler</button>
          <button className="btn grow" onClick={() => finishBlock(run.units)}>Passer l'étape</button>
        </div>
      </div>
    </>
  );
}
