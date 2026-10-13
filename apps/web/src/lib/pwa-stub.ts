/** Version autonome (fichier unique) : pas de service worker. */
export function registerSW(_opts?: unknown) {
  return () => Promise.resolve();
}
