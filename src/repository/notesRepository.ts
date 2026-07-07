import type { Note } from '../state/types';

// The app only ever talks to this async interface, as it would to a real
// backend. Swapping the mock below for fetch() calls is a one-file change.
export interface NotesRepository {
  load(): Promise<Note[]>;
  save(notes: Note[]): Promise<void>;
}

const STORAGE_KEY = 'sticky-notes';
const LATENCY_MS = 250;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Mock REST implementation: simulates network latency so the UI is forced to
// handle real loading/error states; localStorage is only its internal fake DB.
export function createMockRestRepository(): NotesRepository {
  return {
    async load() {
      await delay(LATENCY_MS);
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) return [];
      return JSON.parse(raw) as Note[];
    },
    async save(notes) {
      await delay(LATENCY_MS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    },
  };
}
