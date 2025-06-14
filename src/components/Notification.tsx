import React from 'react';

interface NotificationProps {
  open: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

const colors = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
};

const Notification: React.FC<NotificationProps> = ({ open, message, type = 'info', onClose }) => {
  if (!open) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-6 py-3 rounded shadow text-white flex items-center gap-4 ${colors[type]}`}
      style={{ minWidth: 200 }}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-white font-bold">×</button>
    </div>
  );
};

export default Notification; 