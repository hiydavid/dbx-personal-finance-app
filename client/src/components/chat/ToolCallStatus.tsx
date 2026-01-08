import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { FunctionCall } from "@/lib/types";

interface ToolCallStatusProps {
  functionCalls: FunctionCall[];
  isProcessing: boolean;
}

export function ToolCallStatus({
  functionCalls,
  isProcessing,
}: ToolCallStatusProps) {
  const isThinking = isProcessing && functionCalls.length === 0;
  const allToolsComplete = functionCalls.length > 0 &&
    functionCalls.every((fc) => fc.status === "completed" || fc.status === "error");
  const isFormulatingResponse = isProcessing && allToolsComplete;

  if (!isProcessing && functionCalls.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 text-[var(--color-muted-foreground)]">
      {isThinking && (
        <div className="flex items-center gap-3">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">AI is thinking...</span>
        </div>
      )}

      {functionCalls.map((fc, idx) => (
        <div
          key={fc.call_id || idx}
          className="flex items-center gap-3 animate-in fade-in duration-200"
        >
          {fc.status === "calling" && (
            <Loader2 className="h-4 w-4 animate-spin text-[var(--color-primary)]" />
          )}
          {fc.status === "completed" && (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          )}
          {fc.status === "error" && (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span className="text-sm">{formatFunctionName(fc.name)}</span>
        </div>
      ))}

      {isFormulatingResponse && (
        <div className="flex items-center gap-3 mt-1 animate-in fade-in duration-200">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Formulating response...</span>
        </div>
      )}
    </div>
  );
}

function formatFunctionName(name: string): string {
  // Remove UUID-like suffixes
  const cleanName = name.replace(/_[a-f0-9]{32}$/i, "");
  // Convert snake_case to Title Case
  return cleanName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
