import { useEffect, useState } from 'react';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning';
}

const toasts: Toast[] = [];
const listeners: ((toasts: Toast[]) => void)[] = [];

function notifyListeners() {
  listeners.forEach(listener => listener([...toasts]));
}

export function useToast() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);

  useEffect(() => {
    listeners.push(setCurrentToasts);
    setCurrentToasts([...toasts]);
    return () => {
      const index = listeners.indexOf(setCurrentToasts);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  const toast = ({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, title, description, variant };
    toasts.push(newToast);
    notifyListeners();

    setTimeout(() => {
      const index = toasts.findIndex(t => t.id === id);
      if (index > -1) {
        toasts.splice(index, 1);
        notifyListeners();
      }
    }, 5000);

    return id;
  };

  const dismiss = (id: string) => {
    const index = toasts.findIndex(t => t.id === id);
    if (index > -1) {
      toasts.splice(index, 1);
      notifyListeners();
    }
  };

  return { toast, dismiss, toasts: currentToasts };
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`min-w-[300px] max-w-md p-4 rounded-lg shadow-lg border bg-background ${
            toast.variant === 'success' ? 'border-green-500' :
            toast.variant === 'error' ? 'border-red-500' :
            toast.variant === 'warning' ? 'border-yellow-500' : ''
          }`}
        >
          {toast.title && <div className="font-semibold mb-1">{toast.title}</div>}
          {toast.description && <div className="text-sm text-muted-foreground">{toast.description}</div>}
          <button
            onClick={() => dismiss(toast.id)}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
