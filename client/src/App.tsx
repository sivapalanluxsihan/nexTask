import React, { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import './index.css';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import LoginPage from './pages/auth/LoginPage';
import ForceResetPage from './pages/auth/ForceResetPage';
import ProfilePage from './pages/profile/ProfilePage';
import { RequireAuth, RedirectIfAuthenticated } from './components/auth/RouteGuard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden relative">
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 focus:ring-2 focus:ring-indigo-500"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out shrink-0 bg-slate-50 md:relative md:translate-x-0 ${
          isSidebarOpen ? 'md:w-64' : 'md:w-20'
        }`}
      >
        <div className="w-full h-full overflow-hidden">
          <Sidebar isOpen={isSidebarOpen} />
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white border-l border-slate-200 min-w-0 transition-all duration-300">
        <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 flex flex-col min-h-0 bg-zinc-950">
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <RedirectIfAuthenticated>
                <LoginPage />
              </RedirectIfAuthenticated>
            }
          />

          <Route
            path="/force-reset"
            element={
              <RequireAuth>
                <ForceResetPage />
              </RequireAuth>
            }
          />

          <Route
            path="/*"
            element={
              <RequireAuth>
                <DashboardLayout />
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
