import { EventEmitter } from 'node:events';

// Bus d'événements interne : alimente le direct (SSE) de l'interface.
export const bus = new EventEmitter();
bus.setMaxListeners(200);
