import type { Product, ProductStep, TimeLog } from './types.ts';

/**
 * Temps moyen réel par unité pour une étape.
 *
 * On conserve tout l'historique mais on n'expose que la moyenne. Les sessions
 * les plus récentes pèsent un peu plus (décroissance douce) pour suivre la
 * progression naturelle de l'artisan, sans jamais afficher min / max / record.
 */
export function averageStepMinutes(product: Product, step: ProductStep, logs: TimeLog[]): number {
  const relevant = logs.filter((l) => !l.deleted && l.productId === product.id && l.stepId === step.id && l.units > 0);
  if (relevant.length === 0) return step.minutesPerUnit;
  const sorted = [...relevant].sort((a, b) => a.updatedAt - b.updatedAt);
  let wMin = 0;
  let wUnits = 0;
  sorted.forEach((l, i) => {
    const w = Math.pow(1.15, i - sorted.length + 1); // le plus récent = 1
    wMin += l.minutes * w;
    wUnits += l.units * w;
  });
  const real = wMin / wUnits;
  // Lissage avec l'estimation tant qu'il y a peu de données.
  const confidence = Math.min(1, relevant.length / 3);
  return real * confidence + step.minutesPerUnit * (1 - confidence);
}

/** Identifiant de pseudo-étape utilisé pour les produits fabriqués d'un bloc (mode unitaire). */
export const WHOLE_PRODUCT_STEP = '*';

/** Temps moyen total par unité de produit. */
export function averageProductMinutes(product: Product, logs: TimeLog[]): number {
  const fromSteps = product.steps.length
    ? product.steps.reduce((s, st) => s + averageStepMinutes(product, st, logs), 0)
    : 30;
  const whole = logs.filter((l) => !l.deleted && l.productId === product.id && l.stepId === WHOLE_PRODUCT_STEP && l.units > 0);
  if (whole.length === 0) return fromSteps;
  const real = whole.reduce((a, l) => a + l.minutes, 0) / whole.reduce((a, l) => a + l.units, 0);
  const confidence = Math.min(1, whole.length / 3);
  return real * confidence + fromSteps * (1 - confidence);
}

/** Temps d'atelier total (minutes) sur une période. */
export function workshopMinutes(logs: TimeLog[], fromISO: string, toISO: string): number {
  return logs
    .filter((l) => !l.deleted && l.stepKind !== 'pause' && l.date >= fromISO && l.date <= toISO)
    .reduce((s, l) => s + l.minutes, 0);
}
