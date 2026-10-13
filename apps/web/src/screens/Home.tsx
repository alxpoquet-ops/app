import { useEffect, useState } from 'react';
import { purchaseSuggestions, rankEvents } from '@boss/core';
import { useNav } from '../components/ui.tsx';
import { useRows, useSnapshot } from '../lib/hooks.ts';
import { onSync, type SyncState } from '../lib/sync.ts';

/** Accueil : uniquement 5 gros boutons (+ réglages). Les pastilles signalent ce qui attend. */
export default function Home() {
  const nav = useNav();
  const s = useSnapshot();
  const approvals = useRows('approvals');
  const [sync, setSync] = useState<SyncState>({ status: 'off' });
  useEffect(() => onSync(setSync), []);

  const buyBadge = s ? purchaseSuggestions(s).filter((x) => x.urgency === 'rupture').length : 0;
  const pendingEvents =
    (approvals ?? []).filter((a) => a.status === 'en_attente' && (a.kind === 'candidature' || a.kind === 'publication')).length +
    (s ? rankEvents(s).filter((r) => r.event.status === 'propose' && r.tier === 'prioritaire').length : 0);
  const hour = new Date().getHours();
  const hello = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
  const dot = { ok: '#2f9e6e', pending: '#f2b84b', error: '#e0663e', off: 'transparent' }[sync.status];

  return (
    <>
      <div className="home-top">
        <div>
          <h1>{s?.profile?.businessName ?? 'BOSS IA'}</h1>
          <div className="hello">
            {hello} <span className="sync-dot" style={{ background: dot }} title={sync.message ?? sync.status} />
          </div>
        </div>
        <button className="icon-btn" aria-label="Réglages" onClick={() => nav({ name: 'settings' })}>
          ⚙️
        </button>
      </div>
      <div className="home-grid">
        <Tile emoji="✅" label="À FAIRE" color="var(--todo)" onClick={() => nav({ name: 'todo' })} />
        <Tile emoji="🛒" label="À ACHETER" color="var(--buy)" badge={buyBadge} onClick={() => nav({ name: 'buy' })} />
        <Tile emoji="📦" label="STOCK" color="var(--stock)" onClick={() => nav({ name: 'stock' })} />
        <Tile emoji="🎪" label="ÉVÉNEMENTS" color="var(--events)" badge={pendingEvents} onClick={() => nav({ name: 'events' })} />
        <Tile emoji="📊" label="RÉCAP" color="var(--recap)" onClick={() => nav({ name: 'recap' })} />
      </div>
    </>
  );
}

function Tile({ emoji, label, color, badge, onClick }: { emoji: string; label: string; color: string; badge?: number; onClick: () => void }) {
  return (
    <button className="tile" style={{ background: color }} onClick={onClick}>
      <span className="emoji">{emoji}</span>
      <span className="label">{label}</span>
      {!!badge && <span className="badge">{badge}</span>}
    </button>
  );
}
