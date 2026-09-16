'use client';
import { useStore } from '../lib/store-context';

export default function ToastContainer() {
  const { toasts } = useStore();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className="toast">
          <span style={{ fontSize: '1rem' }}>✨</span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
