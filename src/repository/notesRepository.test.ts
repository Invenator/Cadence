import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockRestRepository } from './notesRepository';
import type { Note } from '../state/types';

// Minimal localStorage stand-in for the node test environment.
const store = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
});

const sample: Note[] = [
  { id: 'n1', x: 1, y: 2, width: 200, height: 180, z: 1, color: 'sky', text: 'hi' },
];

describe('mock REST repository', () => {
  beforeEach(() => store.clear());

  it('resolves an empty list when nothing is stored', async () => {
    await expect(createMockRestRepository().load()).resolves.toEqual([]);
  });

  it('round-trips notes through save and load', async () => {
    const repo = createMockRestRepository();
    await repo.save(sample);
    await expect(repo.load()).resolves.toEqual(sample);
  });

  it('is async: load does not resolve synchronously', () => {
    const repo = createMockRestRepository();
    let settled = false;
    void repo.load().then(() => (settled = true));
    expect(settled).toBe(false);
  });
});
