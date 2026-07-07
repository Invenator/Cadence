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

  const createNote = () => {
    const offset = (state.notes.length % 8) * 28;
    const note: Note = {
      id: crypto.randomUUID(),
      x: 120 + offset,
      y: 100 + offset,
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
