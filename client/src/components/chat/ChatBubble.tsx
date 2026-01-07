import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { ChatModal } from './ChatModal';

export function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Chat Bubble */}
      <button
        onClick={() => setIsOpen(true)}
        className={`
          fixed bottom-6 right-6 z-50
          w-14 h-14 rounded-full
          btn-floating
          flex items-center justify-center
          text-white
          ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}
          transition-all duration-300
        `}
        aria-label="Open AI Assistant"
      >
        {/* Pulse ring effect */}
        <span className="absolute inset-0 rounded-full bg-[var(--color-accent-primary)] pulse-ring" />
        <MessageCircle className="w-6 h-6 relative z-10" />
      </button>

      {/* Chat Modal */}
      <ChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
