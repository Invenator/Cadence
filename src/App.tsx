import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { initialState, nextZ, notesReducer } from './state/notesReducer';
import type { Note, NoteColor } from './state/types';
import { NOTE_DEFAULTS } from './state/types';
import { createMockRestRepository } from './repository/notesRepository';
import { NoteCard } from './components/NoteCard';
import { Toolbar } from './components/Toolbar';
import './styles/app.css';

const SAVE_DEBOUNCE_MS = 400;

export default function App() {
  const [state, dispatch] = useReducer(notesReducer, initialState);
  const [activeColor, setActiveColor] = useState<NoteColor>('sun');
  const [trashState, setTrashState] = useState<'idle' | 'armed' | 'hot'>('idle');
  const trashRef = useRef<HTMLDivElement>(null);
  const repository = useMemo(createMockRestRepository, []);

  useEffect(() => {
    repository
      .load()
      .then((notes) => dispatch({ type: 'LOAD_SUCCESS', notes }))
      .catch(() => dispatch({ type: 'LOAD_ERROR' }));
  }, [repository]);

  // Debounced save keeps the repository in sync without a request per keystroke/drag.
  useEffect(() => {
    if (state.status !== 'ready') return;
    const t = setTimeout(() => void repository.save(state.notes), SAVE_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [state, repository]);

  // Shelf placement: cascade across the viewport's safe region (clear of
  // toolbar and trash), wrap to a new row at the right edge, small jitter
  // so placement reads as human rather than mechanical.
  const createNote = () => {
    const margin = 24;
    const topSafe = 88;
    const bottomSafe = 120;
    const stepX = NOTE_DEFAULTS.width + 32;
    const stepY = 72;
    const cols = Math.max(
      1,
      Math.floor((window.innerWidth - margin * 2 - NOTE_DEFAULTS.width) / stepX) + 1
    );
    const rows = Math.max(
      1,
      Math.floor((window.innerHeight - topSafe - bottomSafe - NOTE_DEFAULTS.height) / stepY) + 1
    );
    const i = state.notes.length % (cols * rows);
    const jitter = () => Math.round(Math.random() * 20 - 10);
    const note: Note = {
      id: crypto.randomUUID(),
      x: Math.max(margin, margin + (i % cols) * stepX + jitter()),
      y: Math.max(topSafe, topSafe + Math.floor(i / cols) * stepY + jitter()),
      width: NOTE_DEFAULTS.width,
      height: NOTE_DEFAULTS.height,
      z: nextZ(state.notes),
      color: activeColor,
      text: '',
    };
    dispatch({ type: 'CREATE_NOTE', note });
  };

  const overTrash = (clientX: number, clientY: number): boolean => {
    const rect = trashRef.current?.getBoundingClientRect();
    if (!rect) return false;
    return (
      clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom
    );
  };

  return (
    <div className="canvas">
      <Toolbar activeColor={activeColor} onColorChange={setActiveColor} onNewNote={createNote} />

      {state.notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onMoveEnd={(x, y) => dispatch({ type: 'MOVE_NOTE', id: note.id, x, y })}
          onResizeEnd={(width, height) =>
            dispatch({ type: 'RESIZE_NOTE', id: note.id, width, height })
          }
          onDelete={() => dispatch({ type: 'DELETE_NOTE', id: note.id })}
          onBringToFront={() => dispatch({ type: 'BRING_TO_FRONT', id: note.id })}
          onTextChange={(text) => dispatch({ type: 'SET_TEXT', id: note.id, text })}
          overTrash={overTrash}
          onDragOverTrashChange={(over, dragging) =>
            setTrashState(over ? 'hot' : dragging ? 'armed' : 'idle')
          }
        />
      ))}

      <div
        ref={trashRef}
        className={`trash-zone${trashState !== 'idle' ? ' armed' : ''}${trashState === 'hot' ? ' hot' : ''}`}
      >
        Drag here to delete
      </div>

      {state.status === 'loading' && <div className="status-pill">Loading notes…</div>}
      {state.status === 'error' && <div className="status-pill error">Could not load notes</div>}
    </div>
  );
}
