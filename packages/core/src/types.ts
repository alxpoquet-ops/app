/**
 * Modèle de données BOSS IA.
 *
 * Toutes les entités synchronisables portent `id` + `updatedAt` (ms epoch) :
 * la synchro est en "last-write-wins" par enregistrement, ce qui suffit pour
 * une entreprise mono-utilisateur utilisée sur plusieurs appareils.
 */

export type ID = string;
export type ISODate = string; // "2026-10-13"

export interface Syncable {
  id: ID;
  updatedAt: number;
  deleted?: boolean;
}

export type StepKind =
  | 'preparation'
  | 'fabrication'
  | 'assemblage'
  | 'controle'
  | 'photo'
  | 'emballage'
  | 'rangement';

export interface ProductStep {
  id: ID;
  name: string;
  kind: StepKind;
  /** Estimation initiale (minutes par unité), remplacée par le temps moyen réel dès qu'il existe. */
  minutesPerUnit: number;
}

export interface BomLine {
  itemId: ID;
  qty: number;
}

export interface Product extends Syncable {
  name: string;
  category: string;
  /** Prix choisi par l'utilisateur. L'application ne propose jamais de prix. */
  price: number;
  stock: number;
  minStock: number;
  mode: 'unitaire' | 'serie';
  components: BomLine[];
  consumables: BomLine[];
  /** Outils / matériel à sortir avant de commencer (checklist de préparation). */
  tools: string[];
  steps: ProductStep[];
  emoji?: string;
}

export interface Item extends Syncable {
  name: string;
  kind: 'composant' | 'consommable';
  unit: string;
  stock: number;
  minStock: number;
  unitCost?: number;
  /** Conditionnement fournisseur (on arrondit les achats à ce multiple). */
  packSize?: number;
  supplierName?: string;
  supplierUrl?: string;
}

export type OrderPriority = 'normale' | 'haute' | 'urgente';
export type OrderStatus = 'nouvelle' | 'en_cours' | 'prete' | 'livree' | 'annulee';

export interface CustomerOrder extends Syncable {
  client: string;
  phone?: string;
  email?: string;
  dueDate?: ISODate;
  description: string;
  productId?: ID;
  quantity: number;
  /** Unités déjà fabriquées pour cette commande. */
  produced: number;
  budget?: number;
  deposit?: number;
  priority: OrderPriority;
  status: OrderStatus;
  createdAt: number;
}

export type EventStatus = 'propose' | 'interesse' | 'candidature' | 'inscrit' | 'refuse' | 'ignore' | 'passe';
export type EventTier = 'prioritaire' | 'interessant' | 'faible';

export interface MarketEvent extends Syncable {
  name: string;
  /** Clé stable entre les années (ex. "marche-de-rethel") pour l'apprentissage. */
  seriesKey: string;
  city: string;
  date: ISODate;
  endDate?: ISODate;
  distanceKm?: number;
  standCost?: number;
  type: 'marche' | 'noel' | 'foire' | 'salon' | 'exposition' | 'createurs' | 'autre';
  url?: string;
  source?: string;
  applicationDeadline?: ISODate;
  status: EventStatus;
  notes?: string;
}

/** Bilan d'un événement passé : la mémoire commerciale. */
export interface EventResult extends Syncable {
  eventId?: ID;
  seriesKey: string;
  name: string;
  date: ISODate;
  cost: number;
  revenue: number;
  productsSold: { productId: ID; qty: number }[];
  comment?: string;
  hoursOnSite?: number;
  distanceKm?: number;
}

export type SaleChannel = 'marche' | 'etsy' | 'commande' | 'direct' | 'autre';

export interface Sale extends Syncable {
  date: ISODate;
  productId: ID;
  qty: number;
  unitPrice: number;
  channel: SaleChannel;
  eventId?: ID;
}

/** Historique complet des temps. Seule la moyenne est affichée. */
export interface TimeLog extends Syncable {
  date: ISODate;
  productId?: ID;
  stepId?: ID;
  stepKind: StepKind | 'pause';
  units: number;
  minutes: number;
  energy?: Energy;
  hour?: number;
}

export type Energy = 'fatigue' | 'normal' | 'motive';

export interface BusinessProfile extends Syncable {
  businessName: string;
  activity: 'artisan' | 'createur' | 'revendeur' | 'mixte';
  craft: string;
  city: string;
  lat?: number;
  lon?: number;
  maxDistanceKm: number;
  availability: { weekend: boolean; semaine: boolean; feries: boolean };
  maxEventsPerMonth: number;
  maxStandBudget: number;
  monthlyRevenueGoal: number;
  commercialGoals?: string;
  presentation?: string;
  /** Comptes externes déclarés (la connexion OAuth se fait côté serveur). */
  accounts?: Record<string, { handle?: string; enabled: boolean }>;
}

export type ApprovalKind = 'achat' | 'candidature' | 'publication' | 'email' | 'signature' | 'depense';
export type ApprovalStatus = 'en_attente' | 'approuve' | 'refuse' | 'execute';

/**
 * Toute action engageant de l'argent, une signature ou une publication passe par ici.
 * L'IA ne peut que *proposer* ; seul un humain fait passer le statut à "approuve".
 */
export interface Approval extends Syncable {
  kind: ApprovalKind;
  title: string;
  summary: string;
  amount?: number;
  payload: Record<string, unknown>;
  status: ApprovalStatus;
  createdAt: number;
  decidedAt?: number;
}

/** Journal brut de tout ce que l'application observe (mémoire long terme). */
export interface Observation extends Syncable {
  ts: number;
  kind: string;
  data: Record<string, unknown>;
}

export interface MediaIdea extends Syncable {
  createdAt: number;
  sourceName: string;
  format: 'reel' | 'short' | 'post' | 'story';
  title: string;
  caption: string;
  hashtags: string[];
  moments: { at?: number; description: string }[];
  status: 'idee' | 'en_validation' | 'publie' | 'rejete';
}

/** Tables synchronisées (nom de table -> type). */
export interface Tables {
  products: Product;
  items: Item;
  orders: CustomerOrder;
  events: MarketEvent;
  eventResults: EventResult;
  sales: Sale;
  timeLogs: TimeLog;
  profile: BusinessProfile;
  approvals: Approval;
  observations: Observation;
  media: MediaIdea;
}
export type TableName = keyof Tables;
export const TABLES: TableName[] = [
  'products',
  'items',
  'orders',
  'events',
  'eventResults',
  'sales',
  'timeLogs',
  'profile',
  'approvals',
  'observations',
  'media',
];

/** Instantané complet de l'entreprise, entrée de tous les moteurs de décision. */
export interface Snapshot {
  today: ISODate;
  products: Product[];
  items: Item[];
  orders: CustomerOrder[];
  events: MarketEvent[];
  eventResults: EventResult[];
  sales: Sale[];
  timeLogs: TimeLog[];
  profile?: BusinessProfile;
}
