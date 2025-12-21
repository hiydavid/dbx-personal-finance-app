import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Edit, FlaskConical, ExternalLink, ArrowRightLeft } from "lucide-react";
import { getAppConfig, type AppBranding } from "@/lib/config";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useAgents } from "@/hooks/useAgents";

interface LeftSidebarProps {
  onEditModeToggle: () => void;
}

export function LeftSidebar({ onEditModeToggle }: LeftSidebarProps) {
  const location = useLocation();
  const [branding, setBranding] = useState<AppBranding>({
    tabTitle: "AI Assistant",
    appName: "AI Assistant",
    companyName: "",
    description: "",
    logoPath: "/logos/databricks-symbol-color.svg",
  });
  const [isMlflowOpen, setIsMlflowOpen] = useState(false);
  const mlflowRef = useRef<HTMLDivElement>(null);
  const { userInfo } = useUserInfo();
  const { agents } = useAgents();

  useEffect(() => {
    getAppConfig().then((config) => setBranding(config.branding));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mlflowRef.current && !mlflowRef.current.contains(event.target as Node)) {
        setIsMlflowOpen(false);
      }
    };
    if (isMlflowOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isMlflowOpen]);

  const agentsWithMlflow = agents.filter((agent) => agent.mlflow_experiment_id);

  const getMlflowUrl = (experimentId: string) => {
    const baseUrl = userInfo?.workspace_url || "";
    return `${baseUrl}/ml/experiments/${experimentId}`;
  };

  const displayName = userInfo?.user?.split("@")[0] || "";
  const isDashboardActive = location.pathname === "/" || location.pathname === "/dashboard";
  const isCashflowActive = location.pathname === "/cashflow";

  return (
    <aside className="fixed left-0 top-0 h-screen w-[200px] bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] flex flex-col z-20">
      {/* Logo and Branding */}
      <div className="p-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 flex-shrink-0">
            <img
              src={branding.logoPath}
              alt={branding.appName}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-[var(--color-text-heading)] truncate">
              {branding.companyName || branding.appName}
            </h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <Link
          to="/dashboard"
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
            ${
              isDashboardActive
                ? "bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]"
                : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]/50 hover:text-[var(--color-foreground)]"
            }
          `}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>
        <Link
          to="/cashflow"
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
            ${
              isCashflowActive
                ? "bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]"
                : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]/50 hover:text-[var(--color-foreground)]"
            }
          `}
        >
          <ArrowRightLeft className="h-4 w-4" />
          <span>Cashflow</span>
        </Link>
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-[var(--color-border)] space-y-2">
        {/* MLflow Experiments */}
        {agentsWithMlflow.length > 0 && (
          <div className="relative" ref={mlflowRef}>
            <button
              onClick={() => setIsMlflowOpen(!isMlflowOpen)}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200
                ${isMlflowOpen ? "bg-[var(--color-muted)]/50" : "hover:bg-[var(--color-muted)]/50"}
                text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]
              `}
              title="MLflow Experiments"
            >
              <FlaskConical className="h-4 w-4" />
              <span>MLflow</span>
            </button>
            {isMlflowOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-[260px] bg-[var(--color-background)] rounded-xl shadow-xl border border-[var(--color-border)] py-2 z-50">
                <div className="px-3 py-1.5 text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wide border-b border-[var(--color-border)]/50 mb-1">
                  MLflow Experiments
                </div>
                {agentsWithMlflow.map((agent) => (
                  <a
                    key={agent.id}
                    href={getMlflowUrl(agent.mlflow_experiment_id!)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-[var(--color-muted)] transition-colors cursor-pointer"
                    onClick={() => setIsMlflowOpen(false)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-[var(--color-foreground)] truncate">
                        {agent.display_name}
                      </div>
                      <div className="text-xs text-[var(--color-muted-foreground)] truncate">
                        {agent.endpoint_name}
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-[var(--color-muted-foreground)] flex-shrink-0" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Edit Mode Toggle */}
        <button
          onClick={onEditModeToggle}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]/50 hover:text-[var(--color-foreground)] transition-all duration-200"
          title="Customize theme"
        >
          <Edit className="h-4 w-4" />
          <span>Customize</span>
        </button>

        {/* User Info */}
        {displayName && (
          <div
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--color-muted)]/30"
            title={userInfo?.user}
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-primary)]/80 flex items-center justify-center text-white text-xs font-medium shadow-sm flex-shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-[var(--color-text-primary)] truncate">
              {displayName}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
