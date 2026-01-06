
import React from "react";
import { ChatCore } from "./ChatCore";

interface ChatViewProps {
  chatId?: string;
  onChatIdChange?: (chatId: string) => void;
  selectedAgentId?: string;
  onAgentChange?: (agentId: string) => void;
  selectedPersonaId?: string;
  onPersonaChange?: (personaId: string | undefined) => void;
  initialMessage?: string;
  onStreamingChange?: (isStreaming: boolean) => void;
}

export function ChatView({
  chatId,
  onChatIdChange,
  selectedAgentId,
  onAgentChange,
  selectedPersonaId,
  onPersonaChange,
  initialMessage,
  onStreamingChange,
}: ChatViewProps) {
  return (
    <ChatCore
      chatId={chatId}
      onChatIdChange={onChatIdChange}
      selectedAgentId={selectedAgentId}
      onAgentChange={onAgentChange}
      selectedPersonaId={selectedPersonaId}
      onPersonaChange={onPersonaChange}
      initialMessage={initialMessage}
      onStreamingChange={onStreamingChange}
      compact={false}
      showAgentSelector={true}
      showPersonaSelector={true}
    />
  );
}
