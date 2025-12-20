import { Routes, Route } from 'react-router-dom';
import { CustomThemeProvider } from '@/contexts/ThemeContext';
import { AgentsProvider } from '@/contexts/AgentsContext';
import { UserProvider } from '@/contexts/UserContext';
import { NavigationProvider } from '@/contexts/NavigationContext';
import { AppConfigProvider } from '@/contexts/AppConfigContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { DashboardPage } from '@/pages/DashboardPage';

function App() {
  return (
    <CustomThemeProvider>
      <UserProvider>
        <AgentsProvider>
          <AppConfigProvider>
            <NavigationProvider>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                </Routes>
              </MainLayout>
            </NavigationProvider>
          </AppConfigProvider>
        </AgentsProvider>
      </UserProvider>
    </CustomThemeProvider>
  );
}

export default App;
