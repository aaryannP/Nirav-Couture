'use client';
import { useStore } from '../lib/store-context';

export default function ToastContainer() {
  const { toasts } = useStore();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none'
      }}
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="toast"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-cream)',
            borderLeft: `4px solid ${toast.type === 'error' ? '#EF4444' : 'var(--accent-gold)'}`,
            color: 'var(--text-primary)',
            padding: '14px 18px',
            borderRadius: '10px',
            boxShadow: 'var(--shadow-lg)',
            fontSize: '0.88rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            minWidth: '260px',
            maxWidth: '360px',
            animation: 'toastSlideIn 0.3s ease',
            pointerEvents: 'auto'
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>
            {toast.type === 'error' ? '✕' : '✓'}
          </span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
