import type { NoteColor } from '../state/types';
import { NOTE_COLORS } from '../state/types';

interface Props {
  activeColor: NoteColor;
  onColorChange: (color: NoteColor) => void;
  onNewNote: () => void;
}

export function Toolbar({ activeColor, onColorChange, onNewNote }: Props) {
  return (
    <div className="toolbar">
      <button className="new-note" onClick={onNewNote}>
        + New note
      </button>
      <div className="swatches">
        {NOTE_COLORS.map((color) => (
          <button
            key={color}
            className={`swatch${color === activeColor ? ' selected' : ''}`}
            style={{ background: `var(--note-${color})` }}
            onClick={() => onColorChange(color)}
            aria-label={`${color} notes`}
          />
        ))}
      </div>
    </div>
  );
}
