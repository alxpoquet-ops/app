import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'todo' }
  | { name: 'buy' }
  | { name: 'stock' }
  | { name: 'events' }
  | { name: 'recap' }
  | { name: 'settings'; page?: string; id?: string };

const NavCtx = createContext<(r: Route) => void>(() => {});
export const NavProvider = NavCtx.Provider;
export const useNav = () => useContext(NavCtx);

export function Bar({ title, back, right }: { title: string; back?: () => void; right?: ReactNode }) {
  const nav = useNav();
  return (
    <div className="bar">
      <button className="back" aria-label="Retour" onClick={back ?? (() => nav({ name: 'home' }))}>
        ←
      </button>
      <h2>{title}</h2>
      {right}
    </div>
  );
}

export function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" role="dialog" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

const ToastCtx = createContext<(msg: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const show = useCallback((m: string) => {
    setMsg(m);
    setTimeout(() => setMsg((cur) => (cur === m ? null : cur)), 3200);
  }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg && <div className="toast" role="status">{msg}</div>}
    </ToastCtx.Provider>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Empty({ emoji, children }: { emoji: string; children: ReactNode }) {
  return (
    <div className="empty">
      <div className="e">{emoji}</div>
      {children}
    </div>
  );
}

/** Petit hook pour les actions asynchrones (IA) avec état "en cours". */
export function useBusy() {
  const [busy, setBusy] = useState<string | null>(null);
  const toast = useToast();
  const run = useCallback(
    async <T,>(label: string, fn: () => Promise<T>): Promise<T | undefined> => {
      setBusy(label);
      try {
        return await fn();
      } catch (e) {
        toast((e as Error).message);
        return undefined;
      } finally {
        setBusy(null);
      }
    },
    [toast],
  );
  return { busy, run };
}
