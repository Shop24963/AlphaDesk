import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppLayout from './app/App';
import Dashboard from './features/dashboard/Dashboard';
import './styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="market" element={<PlaceholderPage title="Market" />} />
            <Route path="stocks" element={<PlaceholderPage title="Stocks" />} />
            <Route path="screener" element={<PlaceholderPage title="Screener" />} />
            <Route path="charts" element={<PlaceholderPage title="Charts" />} />
            <Route path="relative-strength" element={<PlaceholderPage title="Relative Strength" />} />
            <Route path="watchlists" element={<PlaceholderPage title="Watchlists" />} />
            <Route path="setups" element={<PlaceholderPage title="Trade Setups" />} />
            <Route path="paper-trading" element={<PlaceholderPage title="Paper Trading" />} />
            <Route path="portfolio" element={<PlaceholderPage title="Portfolio" />} />
            <Route path="analytics" element={<PlaceholderPage title="Analytics" />} />
            <Route path="strategies" element={<PlaceholderPage title="Strategies" />} />
            <Route path="backtesting" element={<PlaceholderPage title="Backtesting" />} />
            <Route path="alerts" element={<PlaceholderPage title="Alerts" />} />
            <Route path="journal" element={<PlaceholderPage title="Journal" />} />
            <Route path="calculators" element={<PlaceholderPage title="Calculators" />} />
            <Route path="profile" element={<PlaceholderPage title="Profile" />} />
            <Route path="settings" element={<PlaceholderPage title="Settings" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="mt-2 text-muted-foreground">Coming soon in Phase 2+</p>
      </div>
    </div>
  );
}
