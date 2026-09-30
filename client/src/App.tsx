import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { LiveMapPage } from './pages/LiveMapPage';
import { CaseBoardPage } from './pages/CaseBoardPage';
import { ReportPage } from './pages/ReportPage';
import { FederationPage } from './pages/FederationPage';
import { MethodsPage } from './pages/MethodsPage';
import { DemoScenarioModal } from './components/DemoScenarioModal';
import { fetchCities, fetchCases } from './api/client';
import { useAppStore } from './store/useAppStore';

export function App() {
  const { setCities } = useAppStore();
  const [openCasesCount, setOpenCasesCount] = React.useState(3);

  useEffect(() => {
    // Initial fetch of cities
    fetchCities()
      .then((c) => setCities(c))
      .catch((e) => console.error('Failed to load cities:', e));

    // Fetch open cases count for navbar badge
    fetchCases()
      .then((res) => {
        const count = (res.cases || []).filter((c) => c.status !== 'closed').length;
        setOpenCasesCount(count);
      })
      .catch((e) => console.error('Failed to load cases count:', e));
  }, [setCities]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-paper text-ink flex flex-col antialiased selection:bg-signal/20 selection:text-ink">
        <Navbar openCasesCount={openCasesCount} />

        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<LiveMapPage />} />
            <Route path="/cases" element={<CaseBoardPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/federation" element={<FederationPage />} />
            <Route path="/methods" element={<MethodsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Guided Demo Scenario Modal */}
        <DemoScenarioModal />
      </div>
    </BrowserRouter>
  );
}

export default App;
