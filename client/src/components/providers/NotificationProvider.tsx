import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Tipo per le notifiche
export interface Notification {
  id: string;
  type: 'match' | 'tournament' | 'payment' | 'referral' | 'system' | 'success' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date | string;
  read: boolean;
  actionUrl?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'match',
      title: 'Risultato partita',
      message: 'Juventus - Inter: 2-1. Hai vinto 100 crediti!',
      timestamp: 'Oggi, 14:30',
      read: false
    },
    {
      id: '2',
      type: 'tournament',
      title: 'Nuovo torneo disponibile',
      message: 'Serie A 2025 è ora disponibile! Partecipa per vincere premi esclusivi.',
      timestamp: 'Oggi, 10:15',
      read: false,
      actionUrl: '/tournaments/123'
    },
  ]);
  
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Aggiorna il conteggio delle notifiche non lette quando le notifiche cambiano
  useEffect(() => {
    const count = notifications.filter(notif => !notif.read).length;
    setUnreadCount(count);
  }, [notifications]);
  
  // Genera un ID unico per le notifiche
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };
  
  // Aggiungi una nuova notifica
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      timestamp: new Date(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };
  
  // Segna tutte le notifiche come lette
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };
  
  // Segna una notifica specifica come letta
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };
  
  // Rimuovi una notifica
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };
  
  // Rimuovi tutte le notifiche
  const clearAll = () => {
    setNotifications([]);
  };
  
  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAllAsRead,
    markAsRead,
    removeNotification,
    clearAll,
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};