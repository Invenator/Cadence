export interface Note {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  color: NoteColor;
  text: string;
}

export type NoteColor = 'sun' | 'mint' | 'sky' | 'rose' | 'lilac' | 'sand';

export const NOTE_COLORS: NoteColor[] = ['sun', 'mint', 'sky', 'rose', 'lilac', 'sand'];

export const NOTE_DEFAULTS = {
  width: 200,
  height: 180,
  minWidth: 120,
  minHeight: 100,
} as const;
