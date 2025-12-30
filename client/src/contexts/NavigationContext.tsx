import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

export interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  preview: string;
}

// Dev-only logger
const devLog = (...args: unknown[]) => {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
};

export type TabType = 'dashboard';

// Chat panel constants
export const CHAT_PANEL_MIN_WIDTH = 300;
export const CHAT_PANEL_MAX_WIDTH = 600;
export const CHAT_PANEL_DEFAULT_WIDTH = 400;

interface NavigationContextType {
  // Active tab (derived from pathname)
  activeTab: TabType;
  // Navigation
  navigateTo: (tab: TabType) => void;
  // Chat state
  currentChatId: string | undefined;
  setCurrentChatId: (id: string | undefined) => void;
  handleChatIdChange: (chatId: string) => void;
  handleNewChat: () => void;
  handleChatSelect: (chatId: string) => void;
  // Sidebar state
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  // Chat panel state
  chatPanelWidth: number;
  setChatPanelWidth: (width: number) => void;
  isChatPanelCollapsed: boolean;
  setChatPanelCollapsed: (collapsed: boolean) => void;
  isResizingChatPanel: boolean;
  setIsResizingChatPanel: (resizing: boolean) => void;
  // Agent state
  selectedAgentId: string;
  setSelectedAgentId: (id: string) => void;
  // Streaming state
  isStreaming: boolean;
  setIsStreaming: (streaming: boolean) => void;
  // Chats
  chats: Chat[];
  setChats: (chats: Chat[]) => void;
  fetchChats: (signal?: AbortSignal) => Promise<void>;
  // Edit mode
  isEditMode: boolean;
  setIsEditMode: (mode: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}

// Map pathname to tab
function pathnameToTab(_pathname: string): TabType {
  return 'dashboard';
}

interface ChatMessage {
  content: string;
}

interface ChatData {
  id: string;
  title: string;
  messages: ChatMessage[];
  updated_at: string;
}

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  // Derive active tab from pathname
  const activeTab = pathnameToTab(location.pathname);

  // Chat state
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(
    undefined
  );
  const [chats, setChats] = useState<Chat[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Chat panel state
  const [chatPanelWidth, setChatPanelWidthState] = useState(CHAT_PANEL_DEFAULT_WIDTH);
  const [isChatPanelCollapsed, setIsChatPanelCollapsedState] = useState(false);
  const [isResizingChatPanel, setIsResizingChatPanel] = useState(false);

  // Agent state
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');

  // Edit mode
  const [isEditMode, setIsEditMode] = useState(false);

  // Load sidebar collapsed state from localStorage
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed !== null) {
      setIsSidebarCollapsed(savedCollapsed === 'true');
    }
  }, []);

  // Load chat panel state from localStorage
  useEffect(() => {
    const savedWidth = localStorage.getItem('chatPanelWidth');
    if (savedWidth !== null) {
      const width = parseInt(savedWidth, 10);
      if (width >= CHAT_PANEL_MIN_WIDTH && width <= CHAT_PANEL_MAX_WIDTH) {
        setChatPanelWidthState(width);
      }
    }
    const savedCollapsed = localStorage.getItem('chatPanelCollapsed');
    if (savedCollapsed !== null) {
      setIsChatPanelCollapsedState(savedCollapsed === 'true');
    }
  }, []);

  // Fetch chats from API
  const fetchChats = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch('/api/chats', { signal });
      const data: ChatData[] = await response.json();

      const chatList: Chat[] = data.map((chat) => ({
        id: chat.id,
        title: chat.title,
        lastMessage:
          chat.messages.length > 0
            ? chat.messages[chat.messages.length - 1].content
            : '',
        timestamp: new Date(chat.updated_at),
        preview:
          chat.messages.length > 0
            ? chat.messages[chat.messages.length - 1].content.slice(0, 50) +
              '...'
            : '',
      }));

      setChats(chatList);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      console.error('Failed to fetch chat history:', error);
    }
  }, []);

  // Fetch chats on mount
  useEffect(() => {
    const abortController = new AbortController();
    fetchChats(abortController.signal);
    return () => abortController.abort();
  }, [fetchChats]);

  // Navigation
  const navigateTo = useCallback(
    (_tab: TabType) => {
      navigate('/dashboard');
    },
    [navigate]
  );

  // Chat handlers (kept for compatibility)
  const handleNewChat = useCallback(() => {
    if (isStreaming) {
      toast.info('Please wait for the current response to complete', {
        description: 'You can start a new chat once the response finishes',
      });
      return;
    }
    setCurrentChatId(undefined);
    devLog('Starting new chat session');
  }, [isStreaming]);

  const handleChatSelect = useCallback(
    (chatId: string) => {
      if (isStreaming) {
        toast.info('Please wait for the current response to complete', {
          description: 'You can switch chats once the response finishes',
        });
        return;
      }
      setCurrentChatId(chatId);
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    },
    [isStreaming]
  );

  const handleChatIdChange = useCallback(
    (chatId: string) => {
      const isNewChat = currentChatId === undefined && chatId !== undefined;
      setCurrentChatId(chatId);
      if (isNewChat) {
        fetchChats();
      }
    },
    [currentChatId, fetchChats]
  );

  // Sidebar collapse handler with localStorage
  const handleSetSidebarCollapsed = useCallback((collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
    localStorage.setItem('sidebarCollapsed', collapsed.toString());
  }, []);

  // Chat panel width handler with localStorage
  const setChatPanelWidth = useCallback((width: number) => {
    const clampedWidth = Math.min(Math.max(width, CHAT_PANEL_MIN_WIDTH), CHAT_PANEL_MAX_WIDTH);
    setChatPanelWidthState(clampedWidth);
    localStorage.setItem('chatPanelWidth', clampedWidth.toString());
  }, []);

  // Chat panel collapse handler with localStorage
  const setChatPanelCollapsed = useCallback((collapsed: boolean) => {
    setIsChatPanelCollapsedState(collapsed);
    localStorage.setItem('chatPanelCollapsed', collapsed.toString());
  }, []);

  return (
    <NavigationContext.Provider
      value={{
        activeTab,
        navigateTo,
        currentChatId,
        setCurrentChatId,
        handleChatIdChange,
        handleNewChat,
        handleChatSelect,
        isSidebarOpen,
        setIsSidebarOpen,
        isSidebarCollapsed,
        setIsSidebarCollapsed: handleSetSidebarCollapsed,
        chatPanelWidth,
        setChatPanelWidth,
        isChatPanelCollapsed,
        setChatPanelCollapsed,
        isResizingChatPanel,
        setIsResizingChatPanel,
        selectedAgentId,
        setSelectedAgentId,
        isStreaming,
        setIsStreaming,
        chats,
        setChats,
        fetchChats,
        isEditMode,
        setIsEditMode,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}
