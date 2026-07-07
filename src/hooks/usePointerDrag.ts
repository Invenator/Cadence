import { useRef, useCallback } from 'react';

export interface DragEvent {
  dx: number;
  dy: number;
  clientX: number;
  clientY: number;
}

export interface DragHandlers {
  onStart?: () => void;
  onMove: (e: DragEvent) => void;
  onEnd: (e: DragEvent) => void;
}

// Single drag primitive for the whole app. Uses pointer capture so drags
// keep tracking even when the cursor leaves the element or the window.
export function usePointerDrag(handlers: DragHandlers) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  return useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const target = e.currentTarget as HTMLElement;
    const startX = e.clientX;
    const startY = e.clientY;
    target.setPointerCapture(e.pointerId);
    handlersRef.current.onStart?.();

    const toDragEvent = (ev: PointerEvent): DragEvent => ({
      dx: ev.clientX - startX,
      dy: ev.clientY - startY,
      clientX: ev.clientX,
      clientY: ev.clientY,
    });

    const onMove = (ev: PointerEvent) => handlersRef.current.onMove(toDragEvent(ev));
    const onUp = (ev: PointerEvent) => {
      target.releasePointerCapture(ev.pointerId);
      target.removeEventListener('pointermove', onMove);
      target.removeEventListener('pointerup', onUp);
      handlersRef.current.onEnd(toDragEvent(ev));
    };

    target.addEventListener('pointermove', onMove);
    target.addEventListener('pointerup', onUp);
  }, []);
}
