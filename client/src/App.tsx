import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CustomThemeProvider } from '@/contexts/ThemeContext';
import { AgentsProvider } from '@/contexts/AgentsContext';
import { PersonasProvider } from '@/contexts/PersonasContext';
import { UserProvider, getDemoUser } from '@/contexts/UserContext';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { AppConfigProvider } from '@/contexts/AppConfigContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { CashflowPage } from '@/pages/CashflowPage';
import { NetWorthPage } from '@/pages/NetWorthPage';
import { InvestmentsPage } from '@/pages/InvestmentsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { LoginPage } from '@/pages/LoginPage';

/**
 * Auth guard component that redirects to login if not authenticated
 */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAuthenticated = !!getDemoUser();

  if (!isAuthenticated) {
    // Redirect to login page, preserving the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

/**
 * Protected layout wrapper that includes MainLayout and auth guard
 */
function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <AgentsProvider>
        <PersonasProvider>
          <AppConfigProvider>
            <NavigationProvider>
              <MainLayout>
                {children}
              </MainLayout>
            </NavigationProvider>
          </AppConfigProvider>
        </PersonasProvider>
      </AgentsProvider>
    </RequireAuth>
  );
}

function App() {
  return (
    <CustomThemeProvider>
      <UserProvider>
        <Routes>
          {/* Public route - Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route path="/" element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />
          <Route path="/dashboard" element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />
          <Route path="/cashflow" element={<ProtectedLayout><CashflowPage /></ProtectedLayout>} />
          <Route path="/networth" element={<ProtectedLayout><NetWorthPage /></ProtectedLayout>} />
          <Route path="/investments" element={<ProtectedLayout><InvestmentsPage /></ProtectedLayout>} />
          <Route path="/profile" element={<ProtectedLayout><ProfilePage /></ProtectedLayout>} />

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </UserProvider>
    </CustomThemeProvider>
  );
}

export default App;
