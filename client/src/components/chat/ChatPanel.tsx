import { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, PanelRightClose } from 'lucide-react';
import { ChatCore } from './ChatCore';
import { useAgents } from '@/hooks/useAgents';
import { useNavigation } from '@/contexts/NavigationContext';
import { ChatPanelResizeHandle } from '@/components/layout/ResizeHandle';

export function ChatPanel() {
  const [chatId, setChatId] = useState<string | undefined>(undefined);
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>(undefined);
  const [isStreaming, setIsStreaming] = useState(false);
  const { agents } = useAgents();
  const { chatPanelWidth, setChatPanelCollapsed } = useNavigation();

  // Set default agent when agents load
  useEffect(() => {
    if (agents.length > 0 && !selectedAgentId) {
      setSelectedAgentId(agents[0].id);
    }
  }, [agents, selectedAgentId]);

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  const handleNewConversation = () => {
    setChatId(undefined);
  };

  return (
    <div
      className="h-full flex flex-col bg-[var(--color-bg-secondary)] border-l border-[var(--color-border)] relative"
      style={{ width: `${chatPanelWidth}px` }}
    >
      {/* Resize Handle */}
      <ChatPanelResizeHandle />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[var(--color-foreground)]">
            {selectedAgent?.display_name || 'Chat'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleNewConversation}
            disabled={isStreaming}
            className="p-2 rounded-lg hover:bg-[var(--color-muted)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="New conversation"
          >
            <Plus className="h-4 w-4 text-[var(--color-muted-foreground)]" />
          </button>
          <button
            className="p-2 rounded-lg hover:bg-[var(--color-muted)] transition-colors"
            title="More options"
          >
            <MoreHorizontal className="h-4 w-4 text-[var(--color-muted-foreground)]" />
          </button>
          <button
            onClick={() => setChatPanelCollapsed(true)}
            className="p-2 rounded-lg hover:bg-[var(--color-muted)] transition-colors"
            title="Hide chat panel"
          >
            <PanelRightClose className="h-4 w-4 text-[var(--color-muted-foreground)]" />
          </button>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 flex flex-col min-h-0">
        <ChatCore
          chatId={chatId}
          onChatIdChange={setChatId}
          selectedAgentId={selectedAgentId}
          onAgentChange={setSelectedAgentId}
          onStreamingChange={setIsStreaming}
          compact
          showAgentSelector={false}
        />
      </div>

      {/* Footer disclaimer */}
      <div className="px-4 py-2 text-xs text-center text-[var(--color-muted-foreground)] border-t border-[var(--color-border)]">
        AI responses are informational only and are not financial advice.
      </div>
    </div>
  );
}
