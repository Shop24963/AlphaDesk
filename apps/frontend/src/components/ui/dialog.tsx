import { useState } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function Dialog({ open, onOpenChange, children, title, description }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/80"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 w-full max-w-lg bg-background p-6 rounded-lg shadow-lg">
        {(title || description) && (
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-1">
              {title && <h2 className="text-lg font-semibold">{title}</h2>}
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-sm opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function DialogTrigger({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <span onClick={onClick}>{children}</span>;
}

export function DialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mt-4", className)}>{children}</div>;
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">{children}</div>;
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6">{children}</div>;
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold">{children}</h3>;
}

export function DialogDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}
