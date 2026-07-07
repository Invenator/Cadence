import { useEffect, useRef, useState } from 'react';
import type { Note } from '../state/types';
import { NOTE_DEFAULTS } from '../state/types';
import { usePointerDrag } from '../hooks/usePointerDrag';

interface Props {
  note: Note;
  onMoveEnd: (x: number, y: number) => void;
  onResizeEnd: (width: number, height: number) => void;
  onDelete: () => void;
  onBringToFront: () => void;
  onTextChange: (text: string) => void;
  overTrash: (clientX: number, clientY: number) => boolean;
  onDragOverTrashChange: (over: boolean, dragging: boolean) => void;
}

export function NoteCard({
  note,
  onMoveEnd,
  onResizeEnd,
  onDelete,
  onBringToFront,
  onTextChange,
  overTrash,
  onDragOverTrashChange,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  // Notes are draggable by default; double-click enters edit mode, blur exits.
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (editing) textRef.current?.focus();
  }, [editing]);

  // During a drag, position/size updates go straight to the DOM via this ref;
  // reducer state is committed once on release, so the notes array does not
  // re-render on every pointermove.
  const startMove = usePointerDrag({
    onStart: () => {
      setDragging(true);
      onBringToFront();
      onDragOverTrashChange(false, true);
    },
    onMove: ({ dx, dy, clientX, clientY }) => {
      const el = ref.current;
      if (el) {
        el.style.left = `${note.x + dx}px`;
        el.style.top = `${note.y + dy}px`;
      }
      onDragOverTrashChange(overTrash(clientX, clientY), true);
    },
    onEnd: ({ dx, dy, clientX, clientY }) => {
      setDragging(false);
      onDragOverTrashChange(false, false);
      if (overTrash(clientX, clientY)) {
        onDelete();
      } else {
        onMoveEnd(Math.max(0, note.x + dx), Math.max(0, note.y + dy));
      }
    },
  });

  const startResize = usePointerDrag({
    onStart: () => {
      setDragging(true);
      onBringToFront();
    },
    onMove: ({ dx, dy }) => {
      const el = ref.current;
      if (el) {
        el.style.width = `${clampW(note.width + dx)}px`;
        el.style.height = `${clampH(note.height + dy)}px`;
      }
    },
    onEnd: ({ dx, dy }) => {
      setDragging(false);
      onResizeEnd(clampW(note.width + dx), clampH(note.height + dy));
    },
  });

  const exitEditing = () => {
    setEditing(false);
    onTextChange(textRef.current?.textContent ?? '');
  };

  return (
    <div
      ref={ref}
      className={`note${dragging ? ' dragging' : ''}${editing ? ' editing' : ''}`}
      style={{
        left: note.x,
        top: note.y,
        width: note.width,
        height: note.height,
        zIndex: note.z,
        background: `var(--note-${note.color})`,
      }}
      onPointerDown={editing ? undefined : startMove}
      onDoubleClick={() => setEditing(true)}
    >
      <div
        ref={textRef}
        className="note-text"
        contentEditable={editing}
        suppressContentEditableWarning
        onPointerDown={editing ? (e) => e.stopPropagation() : undefined}
        onBlur={exitEditing}
      >
        {note.text}
      </div>
      <div className="resize-handle" onPointerDown={startResize} />
    </div>
  );
}

const clampW = (w: number) => Math.max(NOTE_DEFAULTS.minWidth, w);
const clampH = (h: number) => Math.max(NOTE_DEFAULTS.minHeight, h);
