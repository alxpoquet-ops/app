import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { NavProvider, ToastProvider, type Route } from './components/ui.tsx';
import { db } from './lib/db.ts';
import Home from './screens/Home.tsx';
import Todo from './screens/Todo.tsx';
import Buy from './screens/Buy.tsx';
import Stock from './screens/Stock.tsx';
import Events from './screens/Events.tsx';
import Recap from './screens/Recap.tsx';
import Settings from './screens/Settings.tsx';
import Welcome from './screens/Welcome.tsx';

/** Navigation minimale via l'historique (le bouton retour du téléphone fonctionne). */
export default function App() {
  const [route, setRoute] = useState<Route>(() => (history.state as Route) ?? { name: 'home' });
  useEffect(() => {
    const pop = (e: PopStateEvent) => setRoute((e.state as Route) ?? { name: 'home' });
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, []);
  const nav = (r: Route) => {
    if (r.name === 'home') history.replaceState(r, '');
    else history.pushState(r, '');
    setRoute(r);
    window.scrollTo(0, 0);
  };

  const hasProfile = useLiveQuery(async () => (await db.t('profile').count()) > 0);
  if (hasProfile === undefined) return null;

  return (
    <ToastProvider>
      <NavProvider value={nav}>
        <div className="app">
          {!hasProfile ? (
            <Welcome />
          ) : route.name === 'todo' ? (
            <Todo />
          ) : route.name === 'buy' ? (
            <Buy />
          ) : route.name === 'stock' ? (
            <Stock />
          ) : route.name === 'events' ? (
            <Events />
          ) : route.name === 'recap' ? (
            <Recap />
          ) : route.name === 'settings' ? (
            <Settings page={route.page} id={route.id} />
          ) : (
            <Home />
          )}
        </div>
      </NavProvider>
    </ToastProvider>
  );
}
