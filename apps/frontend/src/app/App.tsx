import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@/hooks/use-theme';
import { Sidebar, SidebarSection, SidebarItem } from '@/components/layout/sidebar';
import { TopNavbar } from '@/components/layout/top-navbar';
import {
  LayoutDashboard,
  TrendingUp,
  Search,
  Activity,
  Briefcase,
  LineChart,
  Target,
  Bell,
  BookOpen,
  Calculator,
  Settings,
  User,
  BarChart3,
  BrainCircuit,
} from 'lucide-react';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    {
      section: 'Main',
      items: [
        { href: '/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
        { href: '/market', icon: <TrendingUp />, label: 'Market' },
        { href: '/stocks', icon: <Activity />, label: 'Stocks' },
      ],
    },
    {
      section: 'Analysis',
      items: [
        { href: '/screener', icon: <Search />, label: 'Screener' },
        { href: '/charts', icon: <BarChart3 />, label: 'Charts' },
        { href: '/relative-strength', icon: <LineChart />, label: 'Relative Strength' },
      ],
    },
    {
      section: 'Trading',
      items: [
        { href: '/watchlists', icon: <Target />, label: 'Watchlists' },
        { href: '/setups', icon: <Target />, label: 'Trade Setups' },
        { href: '/paper-trading', icon: <Briefcase />, label: 'Paper Trading' },
      ],
    },
    {
      section: 'Portfolio',
      items: [
        { href: '/portfolio', icon: <Briefcase />, label: 'Holdings' },
        { href: '/analytics', icon: <LineChart />, label: 'Analytics' },
      ],
    },
    {
      section: 'Strategies',
      items: [
        { href: '/strategies', icon: <BrainCircuit />, label: 'Strategies' },
        { href: '/backtesting', icon: <LineChart />, label: 'Backtesting' },
      ],
    },
    {
      section: 'Tools',
      items: [
        { href: '/alerts', icon: <Bell />, label: 'Alerts' },
        { href: '/journal', icon: <BookOpen />, label: 'Journal' },
        { href: '/calculators', icon: <Calculator />, label: 'Calculators' },
      ],
    },
    {
      section: 'Settings',
      items: [
        { href: '/profile', icon: <User />, label: 'Profile' },
        { href: '/settings', icon: <Settings />, label: 'Settings' },
      ],
    },
  ];

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  return (
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen bg-background">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
          {navigation.map((section) => (
            <SidebarSection key={section.section} title={section.section}>
              {section.items.map((item) => (
                <SidebarItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={isActive(item.href)}
                  onClick={() => setSidebarOpen(false)}
                />
              ))}
            </SidebarSection>
          ))}
        </Sidebar>

        <div className="lg:pl-64">
          <TopNavbar onMenuClick={() => setSidebarOpen(true)} />

          <main className="p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
