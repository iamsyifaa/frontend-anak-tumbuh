import React, { useEffect } from 'react';
import { ToastMessage } from '../types';
import { CheckCircle2, Sparkles, X } from 'lucide-react';

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in max-w-sm w-full bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-sky-500/30 flex items-start space-x-3">
      <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
        <CheckCircle2 className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
          {toast.title} <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </h4>
        <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
