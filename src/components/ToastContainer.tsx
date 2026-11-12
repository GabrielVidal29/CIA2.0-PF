import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { ToastMessage } from '../types/cia';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => {
        const icon =
          toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
          ) : (
            <Info className="w-5 h-5 text-[#164273] shrink-0 mt-0.5" />
          );

        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto bg-white border border-slate-200 rounded-xl shadow-lg p-4 flex items-start gap-3 transition-all duration-200"
          >
            {icon}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900">
                {toast.title}
              </p>
              {toast.description && (
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Fechar notificação"
              className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
