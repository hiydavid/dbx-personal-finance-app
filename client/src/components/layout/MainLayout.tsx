import { useState, useEffect, type ReactNode } from "react";
import { PanelRightOpen } from "lucide-react";
import { LeftSidebar } from "@/components/layout/LeftSidebar";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { EditModePanel } from "@/components/modals/EditModePanel";
import { useNavigation } from "@/contexts/NavigationContext";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const {
    isEditMode,
    setIsEditMode,
    chatPanelWidth,
    isChatPanelCollapsed,
    setChatPanelCollapsed,
    isResizingChatPanel,
  } = useNavigation();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="h-screen bg-[var(--color-background)] flex overflow-hidden">
      {/* Left Sidebar */}
      <LeftSidebar onEditModeToggle={() => setIsEditMode(!isEditMode)} />

      {/* Main Content Area */}
      <main
        className={`flex-1 flex flex-col h-full ml-[200px] bg-[var(--color-background)] overflow-hidden ${
          isResizingChatPanel ? '' : 'transition-[margin-right] duration-300'
        }`}
        style={{ marginRight: isChatPanelCollapsed ? 0 : chatPanelWidth }}
      >
        <div className="relative flex-1 flex flex-col min-h-0 overflow-auto">
          {children}
        </div>
      </main>

      {/* Right Chat Panel */}
      <div
        className={`fixed right-0 top-0 h-full z-40 ${
          isResizingChatPanel ? '' : 'transition-transform duration-300'
        } ${isChatPanelCollapsed ? 'translate-x-full' : ''}`}
      >
        <ChatPanel />
      </div>

      {/* Expand button when chat panel is collapsed */}
      {isChatPanelCollapsed && (
        <button
          onClick={() => setChatPanelCollapsed(false)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50 p-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] border-r-0 rounded-l-lg shadow-lg hover:bg-[var(--color-muted)] transition-colors"
          title="Show chat panel"
        >
          <PanelRightOpen className="h-5 w-5 text-[var(--color-muted-foreground)]" />
        </button>
      )}

      {/* Edit Mode Panel */}
      <EditModePanel isOpen={isEditMode} onClose={() => setIsEditMode(false)} />
    </div>
  );
}
