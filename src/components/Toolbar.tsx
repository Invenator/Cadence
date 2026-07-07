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
      <div className="wordmark">
        <svg className="wordmark-glyph" viewBox="0 0 14 14" aria-hidden="true">
          <rect x="1" y="8" width="3" height="5" rx="1" />
          <rect x="5.5" y="5" width="3" height="8" rx="1" />
          <rect x="10" y="1" width="3" height="12" rx="1" />
        </svg>
        Cadence
      </div>
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
