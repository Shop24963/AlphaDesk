import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { Moon, Sun, Bell, Search, Settings } from 'lucide-react';
import { MobileSidebarTrigger } from './sidebar';

interface TopNavbarProps {
  onMenuClick: () => void;
}

export function TopNavbar({ onMenuClick }: TopNavbarProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card px-4">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <MobileSidebarTrigger onOpen={onMenuClick} />
        
        {/* Global Search */}
        <div className="hidden items-center gap-2 md:flex">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search stocks, indices... (Ctrl+K)"
              className="h-9 w-64 rounded-md border border-input bg-background pl-9 pr-4 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Market Status Badge */}
        <div className="hidden items-center gap-2 rounded-full bg-profit/10 px-3 py-1 text-xs font-medium text-profit md:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-profit opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-profit"></span>
          </span>
          Market Open
        </div>

        {/* Alerts */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-loss"></span>
        </Button>

        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Settings */}
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>

        {/* User Avatar */}
        <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
          JD
        </div>
      </div>
    </header>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center',
        className
      )}
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function SectionHeader({
  title,
  description,
  actions,
}: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
