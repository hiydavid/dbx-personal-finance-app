import { useState, useEffect, type ReactNode } from "react";
import { LeftSidebar } from "@/components/layout/LeftSidebar";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { EditModePanel } from "@/components/modals/EditModePanel";
import { useNavigation } from "@/contexts/NavigationContext";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const { isEditMode, setIsEditMode } = useNavigation();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="h-screen bg-[var(--color-background)] flex overflow-hidden">
      {/* Left Sidebar */}
      <LeftSidebar onEditModeToggle={() => setIsEditMode(!isEditMode)} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full ml-[200px] mr-[400px] bg-[var(--color-background)] overflow-hidden">
        <div className="relative flex-1 flex flex-col min-h-0 overflow-auto">
          {children}
        </div>
      </main>

      {/* Right Chat Panel */}
      <div className="fixed right-0 top-0 h-full z-40">
        <ChatPanel />
      </div>

      {/* Edit Mode Panel */}
      <EditModePanel isOpen={isEditMode} onClose={() => setIsEditMode(false)} />
    </div>
  );
}
