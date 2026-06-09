import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ICONS = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

const COLORS = {
  success: 'border-l-emerald-400',
  error: 'border-l-red-400',
  info: 'border-l-blue-400',
  warning: 'border-l-yellow-400',
};

const Toast = ({ toast, onRemove }) => (
  <div
    className={`glass fade-up flex items-start gap-3 rounded-xl px-4 py-3 min-w-72 max-w-sm border-l-2 ${COLORS[toast.type]} cursor-pointer`}
    style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
    onClick={() => onRemove(toast.id)}
  >
    <span className="text-sm mt-0.5 opacity-70">{ICONS[toast.type]}</span>
    <p className="text-sm leading-snug" style={{ color: 'var(--text-primary)' }}>{toast.message}</p>
  </div>
);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx.addToast;
};
