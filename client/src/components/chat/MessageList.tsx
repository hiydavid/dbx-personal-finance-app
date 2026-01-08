
import React from "react";
import { Message } from "./Message";
import { Message as MessageType, FunctionCall } from "@/lib/types";
import { useAgents } from "@/hooks/useAgents";
import { ToolCallStatus } from "./ToolCallStatus";

interface MessageListProps {
  messages: MessageType[];
  isLoading: boolean;
  activeFunctionCalls?: FunctionCall[];
  onFeedback: (messageId: string, type: "positive" | "negative") => void;
  onViewTrace: (messageId: string) => void;
  selectedAgentId?: string;
  compact?: boolean;
}

export function MessageList({
  messages,
  isLoading,
  activeFunctionCalls,
  onFeedback,
  onViewTrace,
  selectedAgentId,
  compact = false,
}: MessageListProps) {
  const { getAgentById } = useAgents();
  const agent = selectedAgentId ? getAgentById(selectedAgentId) : null;

  if (messages.length === 0 && !isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center h-full text-center ${compact ? "p-4" : "p-8"}`}>
        <div className={compact ? "max-w-sm" : "max-w-md"}>
          <h2 className={`font-medium mb-2 text-[var(--color-foreground)] ${compact ? "text-lg" : "text-2xl"}`}>
            {agent?.chat_title || "AI Assistant"}
          </h2>
          <p className={`text-[var(--color-muted-foreground)] ${compact ? "text-sm" : ""}`}>
            {agent?.chat_subtitle ||
              "Start a conversation with your AI assistant."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col w-full ${compact ? "gap-3 p-3" : "gap-4 p-4 max-w-4xl mx-auto"}`}>
      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          onFeedback={onFeedback}
          onViewTrace={onViewTrace}
          compact={compact}
        />
      ))}

      {isLoading && (
        <ToolCallStatus
          functionCalls={activeFunctionCalls || []}
          isProcessing={isLoading}
        />
      )}
    </div>
  );
}
