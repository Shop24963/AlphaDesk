import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Sidebar({ isOpen, onClose, children }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 border-r bg-card transition-transform lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-14 items-center justify-between border-b px-4">
            <span className="text-lg font-bold">AlphaDesk</span>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            {children}
          </nav>

          {/* Footer */}
          <div className="border-t p-4 text-xs text-muted-foreground">
            <p>© 2024 AlphaDesk</p>
            <p>v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
}

export function SidebarSection({ title, children }: SidebarSectionProps) {
  return (
    <div className="mb-6">
      <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function SidebarItem({
  href,
  icon,
  label,
  isActive = false,
  onClick,
}: SidebarItemProps) {
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
      }}
      className={cn(
        'flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      <span className="flex h-5 w-5 items-center justify-center">{icon}</span>
      {label}
    </a>
  );
}

interface MobileSidebarTriggerProps {
  onOpen: () => void;
}

export function MobileSidebarTrigger({ onOpen }: MobileSidebarTriggerProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="lg:hidden"
      onClick={onOpen}
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}
