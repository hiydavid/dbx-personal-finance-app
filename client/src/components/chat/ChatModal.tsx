import { useState, useEffect } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { ChatCore } from './ChatCore';
import { useAgents } from '@/hooks/useAgents';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const [chatId, setChatId] = useState<string | undefined>(undefined);
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>(undefined);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | undefined>(undefined);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const { agents } = useAgents();

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

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isStreaming) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, isStreaming]);

  if (!isOpen && !isClosing) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 z-50
          bg-black/60
          ${isClosing ? 'opacity-0' : 'animate-backdrop-fade'}
          transition-opacity duration-300
        `}
        onClick={handleClose}
      />

      {/* Modal Panel - Slides in from right */}
      <div
        className={`
          fixed right-0 top-0 bottom-0 z-50
          w-full max-w-lg
          glass-surface
          flex flex-col
          ${isClosing ? 'animate-slide-out-right' : 'animate-slide-in-right'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-primary)]/70 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text-heading)]">
                {selectedAgent?.display_name || 'AI Assistant'}
              </h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                Ask me anything about your finances
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewConversation}
              disabled={isStreaming}
              className="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="New conversation"
            >
              <Plus className="h-5 w-5 text-[var(--color-text-muted)]" />
            </button>
            <button
              onClick={handleClose}
              disabled={isStreaming}
              className="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Close"
            >
              <X className="h-5 w-5 text-[var(--color-text-muted)]" />
            </button>
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex flex-col min-h-0 bg-[var(--color-bg-primary)]/50">
          <ChatCore
            chatId={chatId}
            onChatIdChange={setChatId}
            selectedAgentId={selectedAgentId}
            onAgentChange={setSelectedAgentId}
            selectedPersonaId={selectedPersonaId}
            onPersonaChange={setSelectedPersonaId}
            onStreamingChange={setIsStreaming}
            compact={false}
            showAgentSelector={false}
          />
        </div>

        {/* Footer disclaimer */}
        <div className="px-5 py-3 text-xs text-center text-[var(--color-text-muted)] border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50">
          AI responses are informational only and are not financial advice.
        </div>
      </div>
    </>
  );
}
