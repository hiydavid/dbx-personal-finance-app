import { useCallback, useEffect, useRef } from 'react';

interface UseResizableOptions {
  initialWidth: number;
  minWidth: number;
  maxWidth: number;
  onResize: (width: number) => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
}

export function useResizable({
  initialWidth,
  minWidth,
  maxWidth,
  onResize,
  onResizeStart,
  onResizeEnd,
}: UseResizableOptions) {
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(initialWidth);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = initialWidth;
    onResizeStart?.();

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [initialWidth, onResizeStart]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;

      // For right panel with handle on left edge:
      // dragging left (negative delta) should increase width
      const delta = startX.current - e.clientX;
      const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidth.current + delta));
      onResize(newWidth);
    };

    const handleMouseUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        onResizeEnd?.();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [minWidth, maxWidth, onResize, onResizeEnd]);

  return { handleMouseDown };
}
