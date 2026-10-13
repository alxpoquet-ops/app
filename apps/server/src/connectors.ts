/**
 * Connecteurs sortants (Gmail, Instagram, Etsy, fournisseurs…).
 *
 * N'est appelé qu'après validation humaine (voir /api/actions/:id/execute).
 * Tant qu'un compte n'est pas relié dans Réglages, on bascule en mode
 * "manuel assisté" : l'app ouvre le bon lien / brouillon pré-rempli et
 * l'humain finalise lui-même. Aucun paiement n'est jamais déclenché par le
 * serveur : un achat validé ouvre la page du fournisseur.
 */
import type { Approval } from '@boss/core';

export interface ExecutionResult {
  mode: 'auto' | 'manuel';
  message: string;
  openUrl?: string;
}

type Connector = (a: Approval) => Promise<ExecutionResult>;

const connectors: Partial<Record<Approval['kind'], Connector>> = {
  async achat(a) {
    const url = typeof a.payload.supplierUrl === 'string' ? a.payload.supplierUrl : undefined;
    return { mode: 'manuel', message: 'Achat validé : je t’ouvre la page du fournisseur, le paiement reste entre tes mains.', openUrl: url };
  },
  async candidature(a) {
    const to = typeof a.payload.email === 'string' ? a.payload.email : '';
    const subject = String(a.payload.subject ?? a.title);
    const body = String(a.payload.letter ?? '');
    return {
      mode: 'manuel',
      message: 'Candidature validée : brouillon d’e-mail prêt, joins les photos et envoie.',
      openUrl: `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    };
  },
  async publication(a) {
    return { mode: 'manuel', message: 'Publication validée : le texte est copié, colle-le dans ton application.', openUrl: undefined };
  },
};

export async function executeApproved(a: Approval): Promise<ExecutionResult> {
  const c = connectors[a.kind];
  if (!c) return { mode: 'manuel', message: 'Validé. Cette action se fait à la main pour l’instant.' };
  return c(a);
}
