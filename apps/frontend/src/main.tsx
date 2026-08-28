import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppLayout from './app/App';
import Dashboard from './features/dashboard/Dashboard';
import LoginPage from './features/auth/LoginPage';
import MarketPage from './features/market/MarketPage';
import StocksPage from './features/stocks/StocksPage';
import WatchlistsPage from './features/watchlists/WatchlistsPage';
import PortfolioPage from './features/portfolio/PortfolioPage';
import ScreenerPage from './features/screener/ScreenerPage';
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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="market" element={<MarketPage />} />
            <Route path="stocks" element={<StocksPage />} />
            <Route path="screener" element={<ScreenerPage />} />
            <Route path="charts" element={<PlaceholderPage title="Charts" />} />
            <Route path="relative-strength" element={<PlaceholderPage title="Relative Strength" />} />
            <Route path="watchlists" element={<WatchlistsPage />} />
            <Route path="setups" element={<PlaceholderPage title="Trade Setups" />} />
            <Route path="paper-trading" element={<PlaceholderPage title="Paper Trading" />} />
            <Route path="portfolio" element={<PortfolioPage />} />
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
