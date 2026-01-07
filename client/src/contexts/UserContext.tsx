import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";

interface UserContextType {
  user: string | null;
  workspaceUrl: string | null;
  lakebaseConfigured: boolean;
  lakebaseProjectId: string | null;
  lakebaseError: string | null;
  loading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Storage key for demo user
const DEMO_USER_KEY = "demoUserEmail";

/**
 * Get the demo user email from localStorage
 */
export function getDemoUser(): string | null {
  return localStorage.getItem(DEMO_USER_KEY);
}

/**
 * Set the demo user email in localStorage
 */
export function setDemoUser(email: string): void {
  localStorage.setItem(DEMO_USER_KEY, email);
}

/**
 * Clear the demo user from localStorage
 */
export function clearDemoUser(): void {
  localStorage.removeItem(DEMO_USER_KEY);
}

/**
 * Create headers object with demo user header if set
 */
export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const demoUser = getDemoUser();
  if (demoUser) {
    headers["x-demo-user"] = demoUser;
  }
  return headers;
}

/**
 * Fetch wrapper that includes demo user header
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const demoUser = getDemoUser();
  const headers = new Headers(options.headers);

  if (demoUser) {
    headers.set("x-demo-user", demoUser);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
}

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<string | null>(null);
  const [workspaceUrl, setWorkspaceUrl] = useState<string | null>(null);
  const [lakebaseConfigured, setLakebaseConfigured] = useState(false);
  const [lakebaseProjectId, setLakebaseProjectId] = useState<string | null>(null);
  const [lakebaseError, setLakebaseError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Check if demo user is set in localStorage
  const demoUser = getDemoUser();
  const isAuthenticated = !!demoUser;

  const logout = useCallback(() => {
    clearDemoUser();
    // Redirect to login page
    window.location.href = "/login";
  }, []);

  useEffect(() => {
    // If no demo user is set, skip fetching user info
    if (!demoUser) {
      setLoading(false);
      return;
    }

    // Fetch user info with the demo user header
    fetchWithAuth("/api/me")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load user info: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }
        setUser(data.user);
        setWorkspaceUrl(data.workspace_url);
        setLakebaseConfigured(data.lakebase_configured || false);
        setLakebaseProjectId(data.lakebase_project_id || null);
        setLakebaseError(data.lakebase_error || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load user info:", err);
        setError(err);
        setLoading(false);
      });
  }, [demoUser]);

  return (
    <UserContext.Provider
      value={{
        user,
        workspaceUrl,
        lakebaseConfigured,
        lakebaseProjectId,
        lakebaseError,
        loading,
        error,
        isAuthenticated,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
