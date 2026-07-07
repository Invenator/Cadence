import { describe, expect, it } from 'vitest';
import { initialState, notesReducer } from './notesReducer';
import type { Note } from './types';

const note = (overrides: Partial<Note> = {}): Note => ({
  id: 'n1',
  x: 10,
  y: 20,
  width: 200,
  height: 180,
  z: 1,
  color: 'sun',
  text: '',
  ...overrides,
});

const readyState = (notes: Note[]) => ({ notes, status: 'ready' as const });

describe('notesReducer', () => {
  it('enters ready state with loaded notes', () => {
    const s = notesReducer(initialState, { type: 'LOAD_SUCCESS', notes: [note()] });
    expect(s.status).toBe('ready');
    expect(s.notes).toHaveLength(1);
  });

  it('enters error state on load failure', () => {
    expect(notesReducer(initialState, { type: 'LOAD_ERROR' }).status).toBe('error');
  });

  it('creates a note', () => {
    const s = notesReducer(readyState([]), { type: 'CREATE_NOTE', note: note() });
    expect(s.notes).toHaveLength(1);
  });

  it('moves only the targeted note', () => {
    const s = notesReducer(readyState([note(), note({ id: 'n2' })]), {
      type: 'MOVE_NOTE',
      id: 'n1',
      x: 99,
      y: 88,
    });
    expect(s.notes[0]).toMatchObject({ x: 99, y: 88 });
    expect(s.notes[1]).toMatchObject({ x: 10, y: 20 });
  });

  it('resizes a note', () => {
    const s = notesReducer(readyState([note()]), {
      type: 'RESIZE_NOTE',
      id: 'n1',
      width: 300,
      height: 250,
    });
    expect(s.notes[0]).toMatchObject({ width: 300, height: 250 });
  });

  it('deletes a note', () => {
    const s = notesReducer(readyState([note(), note({ id: 'n2' })]), {
      type: 'DELETE_NOTE',
      id: 'n1',
    });
    expect(s.notes.map((n) => n.id)).toEqual(['n2']);
  });

  it('sets color and text', () => {
    let s = notesReducer(readyState([note()]), { type: 'SET_COLOR', id: 'n1', color: 'mint' });
    s = notesReducer(s, { type: 'SET_TEXT', id: 'n1', text: 'hello' });
    expect(s.notes[0]).toMatchObject({ color: 'mint', text: 'hello' });
  });

  it('brings a note above the current max z', () => {
    const s = notesReducer(readyState([note({ z: 1 }), note({ id: 'n2', z: 5 })]), {
      type: 'BRING_TO_FRONT',
      id: 'n1',
    });
    expect(s.notes[0].z).toBe(6);
  });
});
