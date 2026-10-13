/** Jeu de données d'exemple : un atelier de fleurs en fil / perles. */
import { addDays } from './dates.ts';
import type { BusinessProfile, CustomerOrder, EventResult, Item, MarketEvent, Product, Sale, Tables } from './types.ts';

export function demoData(today: string): { [K in keyof Tables]?: Tables[K][] } {
  const t = Date.now();
  const items: Item[] = [
    { id: 'it-fil-rouge', name: 'Fil rouge', kind: 'composant', unit: 'm', stock: 12, minStock: 10, unitCost: 0.4, packSize: 25, supplierName: 'Perles & Co', supplierUrl: 'https://www.perlesandco.com', updatedAt: t },
    { id: 'it-fil-vert', name: 'Fil vert', kind: 'composant', unit: 'm', stock: 30, minStock: 10, unitCost: 0.4, packSize: 25, supplierName: 'Perles & Co', supplierUrl: 'https://www.perlesandco.com', updatedAt: t },
    { id: 'it-fil-blanc', name: 'Fil blanc', kind: 'composant', unit: 'm', stock: 20, minStock: 10, unitCost: 0.4, packSize: 25, supplierName: 'Perles & Co', supplierUrl: 'https://www.perlesandco.com', updatedAt: t },
    { id: 'it-tige', name: 'Tige métal', kind: 'composant', unit: 'pièce', stock: 18, minStock: 10, unitCost: 0.25, packSize: 50, supplierName: 'Cultura', supplierUrl: 'https://www.cultura.com', updatedAt: t },
    { id: 'it-perle', name: 'Perles nacrées', kind: 'composant', unit: 'pièce', stock: 140, minStock: 50, unitCost: 0.05, packSize: 200, updatedAt: t },
    { id: 'it-adhesif', name: 'Ruban adhésif floral', kind: 'consommable', unit: 'rouleau', stock: 1, minStock: 2, unitCost: 2.9, packSize: 3, updatedAt: t },
    { id: 'it-boite', name: 'Boîte cadeau', kind: 'consommable', unit: 'pièce', stock: 8, minStock: 10, unitCost: 0.9, packSize: 20, updatedAt: t },
  ];
  const products: Product[] = [
    {
      id: 'p-rose-rubis', name: 'Rose Rubis', emoji: '🌹', category: 'Fleurs', price: 18, stock: 2, minStock: 6, mode: 'serie',
      components: [{ itemId: 'it-fil-rouge', qty: 1.5 }, { itemId: 'it-fil-vert', qty: 0.5 }, { itemId: 'it-tige', qty: 1 }],
      consumables: [{ itemId: 'it-adhesif', qty: 0.05 }, { itemId: 'it-boite', qty: 1 }],
      tools: ['Pince', 'Support', 'Ciseaux'],
      steps: [
        { id: 's-petales', name: 'Pétales', kind: 'fabrication', minutesPerUnit: 8 },
        { id: 's-tiges', name: 'Tiges', kind: 'fabrication', minutesPerUnit: 3 },
        { id: 's-assemblage', name: 'Assemblage', kind: 'assemblage', minutesPerUnit: 4 },
        { id: 's-controle', name: 'Contrôle', kind: 'controle', minutesPerUnit: 0.5 },
        { id: 's-emballage', name: 'Mise en boîte', kind: 'emballage', minutesPerUnit: 1 },
      ],
      updatedAt: t,
    },
    {
      id: 'p-lys-perle', name: 'Lys Perle', emoji: '🤍', category: 'Fleurs', price: 24, stock: 4, minStock: 4, mode: 'serie',
      components: [{ itemId: 'it-fil-blanc', qty: 2 }, { itemId: 'it-perle', qty: 12 }, { itemId: 'it-tige', qty: 1 }],
      consumables: [{ itemId: 'it-adhesif', qty: 0.05 }, { itemId: 'it-boite', qty: 1 }],
      tools: ['Pince', 'Aiguille à perles'],
      steps: [
        { id: 's-lys-petales', name: 'Pétales perlés', kind: 'fabrication', minutesPerUnit: 14 },
        { id: 's-lys-assemblage', name: 'Assemblage', kind: 'assemblage', minutesPerUnit: 5 },
        { id: 's-lys-photo', name: 'Photo', kind: 'photo', minutesPerUnit: 1 },
        { id: 's-lys-emballage', name: 'Mise en boîte', kind: 'emballage', minutesPerUnit: 1 },
      ],
      updatedAt: t,
    },
    {
      id: 'p-bouquet', name: 'Bouquet sur mesure', emoji: '💐', category: 'Bouquets', price: 85, stock: 0, minStock: 0, mode: 'unitaire',
      components: [{ itemId: 'it-tige', qty: 5 }], consumables: [{ itemId: 'it-adhesif', qty: 0.2 }], tools: ['Pince', 'Ruban'],
      steps: [{ id: 's-bq', name: 'Composition', kind: 'assemblage', minutesPerUnit: 60 }],
      updatedAt: t,
    },
  ];
  const profile: BusinessProfile = {
    id: 'profile', updatedAt: t, businessName: "L'Atelier des Fleurs", activity: 'artisan', craft: 'Fleurs en fil et perles',
    city: 'Reims', maxDistanceKm: 80, availability: { weekend: true, semaine: false, feries: true },
    maxEventsPerMonth: 3, maxStandBudget: 120, monthlyRevenueGoal: 1500,
    presentation: "Je crée à la main des fleurs éternelles en fil et en perles, pièce par pièce, dans mon atelier rémois.",
  };
  const orders: CustomerOrder[] = [
    { id: 'o-dupont', client: 'Mme Dupont', phone: '06 12 34 56 78', description: '3 Roses Rubis pour un anniversaire', productId: 'p-rose-rubis', quantity: 3, produced: 0, dueDate: addDays(today, 4), priority: 'haute', status: 'nouvelle', deposit: 20, budget: 54, createdAt: t, updatedAt: t },
  ];
  const y = Number(today.slice(0, 4));
  const results: EventResult[] = [
    { id: 'r1', seriesKey: 'marche-de-noel-de-rethel', name: 'Marché de Noël de Rethel', date: `${y - 3}-12-07`, cost: 40, revenue: 520, productsSold: [{ productId: 'p-rose-rubis', qty: 18 }, { productId: 'p-lys-perle', qty: 8 }], hoursOnSite: 9, distanceKm: 40, updatedAt: t },
    { id: 'r2', seriesKey: 'marche-de-noel-de-rethel', name: 'Marché de Noël de Rethel', date: `${y - 2}-12-06`, cost: 45, revenue: 610, productsSold: [{ productId: 'p-rose-rubis', qty: 21 }, { productId: 'p-lys-perle', qty: 10 }], hoursOnSite: 9, distanceKm: 40, updatedAt: t },
    { id: 'r3', seriesKey: 'marche-de-noel-de-rethel', name: 'Marché de Noël de Rethel', date: `${y - 1}-12-05`, cost: 45, revenue: 580, productsSold: [{ productId: 'p-rose-rubis', qty: 20 }, { productId: 'p-lys-perle', qty: 9 }], hoursOnSite: 9, distanceKm: 40, updatedAt: t },
    { id: 'r4', seriesKey: 'foire-de-chalons', name: 'Foire de Châlons', date: `${y - 1}-09-05`, cost: 150, revenue: 260, productsSold: [{ productId: 'p-rose-rubis', qty: 9 }, { productId: 'p-lys-perle', qty: 4 }], hoursOnSite: 10, distanceKm: 45, updatedAt: t },
  ];
  const events: MarketEvent[] = [
    { id: 'e-rethel', name: 'Marché de Noël de Rethel', seriesKey: 'marche-de-noel-de-rethel', city: 'Rethel', date: `${y}-12-05`, distanceKm: 40, standCost: 45, type: 'noel', status: 'inscrit', updatedAt: t },
    { id: 'e-reims-crea', name: 'Salon des Créateurs de Reims', seriesKey: 'salon-des-createurs-de-reims', city: 'Reims', date: addDays(today, 26), distanceKm: 5, standCost: 60, type: 'createurs', status: 'propose', applicationDeadline: addDays(today, 6), updatedAt: t },
    { id: 'e-paris', name: 'Salon Maison & Objet off', seriesKey: 'salon-maison-objet-off', city: 'Paris', date: addDays(today, 40), distanceKm: 145, standCost: 350, type: 'salon', status: 'propose', updatedAt: t },
  ];
  const sales: Sale[] = [];
  // Un peu d'historique de ventes en ligne pour la saisonnalité.
  for (let i = 1; i <= 110; i += 9) {
    sales.push({ id: `sa-${i}`, date: addDays(today, -i), productId: i % 2 ? 'p-rose-rubis' : 'p-lys-perle', qty: 1, unitPrice: i % 2 ? 18 : 24, channel: 'etsy', updatedAt: t });
  }
  return { items, products, profile: [profile], orders, eventResults: results, events, sales };
}
