import type { Note, NoteColor } from './types';

export interface NotesState {
  notes: Note[];
  status: 'loading' | 'ready' | 'error';
}

export type NotesAction =
  | { type: 'LOAD_SUCCESS'; notes: Note[] }
  | { type: 'LOAD_ERROR' }
  | { type: 'CREATE_NOTE'; note: Note }
  | { type: 'MOVE_NOTE'; id: string; x: number; y: number }
  | { type: 'RESIZE_NOTE'; id: string; width: number; height: number }
  | { type: 'DELETE_NOTE'; id: string }
  | { type: 'SET_COLOR'; id: string; color: NoteColor }
  | { type: 'SET_TEXT'; id: string; text: string }
  | { type: 'BRING_TO_FRONT'; id: string };

export const initialState: NotesState = { notes: [], status: 'loading' };

export function nextZ(notes: Note[]): number {
  return notes.reduce((max, n) => Math.max(max, n.z), 0) + 1;
}

export function notesReducer(state: NotesState, action: NotesAction): NotesState {
  switch (action.type) {
    case 'LOAD_SUCCESS':
      return { notes: action.notes, status: 'ready' };
    case 'LOAD_ERROR':
      return { ...state, status: 'error' };
    case 'CREATE_NOTE':
      return { ...state, notes: [...state.notes, action.note] };
    case 'MOVE_NOTE':
      return update(state, action.id, () => ({ x: action.x, y: action.y }));
    case 'RESIZE_NOTE':
      return update(state, action.id, () => ({ width: action.width, height: action.height }));
    case 'DELETE_NOTE':
      return { ...state, notes: state.notes.filter((n) => n.id !== action.id) };
    case 'SET_COLOR':
      return update(state, action.id, () => ({ color: action.color }));
    case 'SET_TEXT':
      return update(state, action.id, () => ({ text: action.text }));
    case 'BRING_TO_FRONT':
      return update(state, action.id, (notes) => ({ z: nextZ(notes) }));
  }
}

function update(
  state: NotesState,
  id: string,
  patch: (notes: Note[]) => Partial<Note>
): NotesState {
  return {
    ...state,
    notes: state.notes.map((n) => (n.id === id ? { ...n, ...patch(state.notes) } : n)),
  };
}
