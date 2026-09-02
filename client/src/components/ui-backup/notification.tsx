import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Bell, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [
      ...prev,
      { ...notification, id, duration: notification.duration || 5000 },
    ]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
      }}
    >
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

// Notification variants based on type
const notificationStyles: Record<NotificationType, string> = {
  info: 'bg-blue-50 border-blue-200',
  success: 'bg-green-50 border-green-200',
  warning: 'bg-amber-50 border-amber-200',
  error: 'bg-red-50 border-red-200',
};

const iconStyles: Record<NotificationType, string> = {
  info: 'bg-blue-100 text-blue-600',
  success: 'bg-green-100 text-green-600',
  warning: 'bg-amber-100 text-amber-600',
  error: 'bg-red-100 text-red-600',
};

const NotificationItem = ({
  notification,
  onClose,
}: {
  notification: Notification;
  onClose: () => void;
}) => {
  const { id, title, message, type, duration } = notification;

  useEffect(() => {
    if (duration !== Infinity) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [duration, onClose]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'w-full max-w-sm rounded-lg border p-4 shadow-lg',
        notificationStyles[type]
      )}
    >
      <div className="flex items-start">
        <div className={cn('mr-3 flex rounded-full p-2', iconStyles[type])}>
          {type === 'info' && <Info className="h-4 w-4" />}
          {type === 'success' && <CheckCircle className="h-4 w-4" />}
          {type === 'warning' && <AlertTriangle className="h-4 w-4" />}
          {type === 'error' && <AlertCircle className="h-4 w-4" />}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-800">{title}</h4>
          <p className="mt-1 text-xs text-gray-600">{message}</p>
        </div>
        <button onClick={onClose} className="ml-3 text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 sm:max-w-md">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};