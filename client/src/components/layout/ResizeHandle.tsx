import { useNavigation, CHAT_PANEL_MIN_WIDTH, CHAT_PANEL_MAX_WIDTH } from '@/contexts/NavigationContext';
import { useResizable } from '@/hooks/useResizable';

export function ChatPanelResizeHandle() {
  const {
    chatPanelWidth,
    setChatPanelWidth,
    isResizingChatPanel,
    setIsResizingChatPanel,
  } = useNavigation();

  const { handleMouseDown } = useResizable({
    initialWidth: chatPanelWidth,
    minWidth: CHAT_PANEL_MIN_WIDTH,
    maxWidth: CHAT_PANEL_MAX_WIDTH,
    onResize: setChatPanelWidth,
    onResizeStart: () => setIsResizingChatPanel(true),
    onResizeEnd: () => setIsResizingChatPanel(false),
  });

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`
        absolute left-0 top-0 h-full w-1 cursor-col-resize z-50
        hidden lg:block
        transition-colors duration-150
        ${isResizingChatPanel
          ? 'bg-[var(--color-accent-primary)]'
          : 'bg-transparent hover:bg-[var(--color-accent-primary)]/50'
        }
      `}
    >
      <div
        className={`
          absolute left-0 top-1/2 -translate-y-1/2 w-1 h-16 rounded-full
          transition-opacity duration-150
          ${isResizingChatPanel
            ? 'opacity-100 bg-[var(--color-accent-primary)]'
            : 'opacity-0 group-hover:opacity-100 bg-[var(--color-accent-primary)]/70'
          }
        `}
      />
    </div>
  );
}
