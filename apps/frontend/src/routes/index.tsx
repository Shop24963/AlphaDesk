import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/features/auth/useAuth';
import { LoginPage } from '@/features/auth/LoginPage';
import { Dashboard } from '@/features/dashboard/Dashboard';
import { MarketPage } from '@/features/market/MarketPage';
import { StocksPage } from '@/features/stocks/StocksPage';
import { WatchlistsPage } from '@/features/watchlists/WatchlistsPage';
import { ScreenerPage } from '@/features/screener/ScreenerPage';
import { PortfolioPage } from '@/features/portfolio/PortfolioPage';
import { AlertsPage } from '@/features/alerts/AlertsPage';
import { PaperTradingPage } from '@/features/trading/PaperTradingPage';
import { AnalyticsPage } from '@/features/portfolio/AnalyticsPage';
import { JournalPage } from '@/features/journal/JournalPage';
import { StrategiesPage } from '@/features/strategies/StrategiesPage';
import { BacktestingPage } from '@/features/backtesting/BacktestingPage';

// Placeholder components for remaining pages
const ChartsPage = () => <div className="p-8"><h2 className="text-2xl font-bold">Charts</h2><p className="text-muted-foreground mt-2">Advanced charting coming soon.</p></div>;
const RelativeStrengthPage = () => <div className="p-8"><h2 className="text-2xl font-bold">Relative Strength</h2><p className="text-muted-foreground mt-2">RS analysis coming soon.</p></div>;
const SetupsPage = () => <div className="p-8"><h2 className="text-2xl font-bold">Trade Setups</h2><p className="text-muted-foreground mt-2">Setup scanner coming soon.</p></div>;
const CalculatorsPage = () => <div className="p-8"><h2 className="text-2xl font-bold">Calculators</h2><p className="text-muted-foreground mt-2">Trading calculators coming soon.</p></div>;
const ProfilePage = () => <div className="p-8"><h2 className="text-2xl font-bold">Profile</h2><p className="text-muted-foreground mt-2">User profile coming soon.</p></div>;
const SettingsPage = () => <div className="p-8"><h2 className="text-2xl font-bold">Settings</h2><p className="text-muted-foreground mt-2">Application settings coming soon.</p></div>;
const AdminPage = () => <div className="p-8"><h2 className="text-2xl font-bold">Admin</h2><p className="text-muted-foreground mt-2">Admin panel coming soon.</p></div>;

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'market', element: <MarketPage /> },
      { path: 'stocks', element: <StocksPage /> },
      { path: 'charts', element: <ChartsPage /> },
      { path: 'watchlists', element: <WatchlistsPage /> },
      { path: 'screener', element: <ScreenerPage /> },
      { path: 'relative-strength', element: <RelativeStrengthPage /> },
      { path: 'setups', element: <SetupsPage /> },
      { path: 'portfolio', element: <PortfolioPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'strategies', element: <StrategiesPage /> },
      { path: 'backtesting', element: <BacktestingPage /> },
      { path: 'paper-trading', element: <PaperTradingPage /> },
      { path: 'alerts', element: <AlertsPage /> },
      { path: 'journal', element: <JournalPage /> },
      { path: 'calculators', element: <CalculatorsPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'admin', element: <AdminPage /> },
    ],
  },
]);
