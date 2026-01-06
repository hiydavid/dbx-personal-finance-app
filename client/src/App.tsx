import { Routes, Route } from 'react-router-dom';
import { CustomThemeProvider } from '@/contexts/ThemeContext';
import { AgentsProvider } from '@/contexts/AgentsContext';
import { PersonasProvider } from '@/contexts/PersonasContext';
import { UserProvider } from '@/contexts/UserContext';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { AppConfigProvider } from '@/contexts/AppConfigContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { CashflowPage } from '@/pages/CashflowPage';
import { NetWorthPage } from '@/pages/NetWorthPage';
import { InvestmentsPage } from '@/pages/InvestmentsPage';
import { ProfilePage } from '@/pages/ProfilePage';

function App() {
  return (
    <CustomThemeProvider>
      <UserProvider>
        <AgentsProvider>
          <PersonasProvider>
            <AppConfigProvider>
              <NavigationProvider>
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/cashflow" element={<CashflowPage />} />
                    <Route path="/networth" element={<NetWorthPage />} />
                    <Route path="/investments" element={<InvestmentsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                  </Routes>
                </MainLayout>
              </NavigationProvider>
            </AppConfigProvider>
          </PersonasProvider>
        </AgentsProvider>
      </UserProvider>
    </CustomThemeProvider>
  );
}

export default App;
