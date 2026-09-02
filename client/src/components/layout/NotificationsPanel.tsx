import React from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Calendar, 
  Trophy, 
  CreditCard, 
  UserPlus, 
  CheckCheck, 
  X 
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useNotifications, Notification } from '@/components/providers/NotificationProvider';

interface NotificationsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ open, onOpenChange }) => {
  const [, setLocation] = useLocation();
  
  // Usa le notifiche dal provider
  const { 
    notifications, 
    markAllAsRead, 
    markAsRead, 
    removeNotification, 
    clearAll 
  } = useNotifications();

  // Segna tutte le notifiche come lette quando il pannello viene aperto
  React.useEffect(() => {
    if (open) {
      markAllAsRead();
    }
  }, [open, markAllAsRead]);

  // Funzione per gestire il click su una notifica
  const handleNotificationClick = (notification: Notification) => {
    if (notification.actionUrl) {
      onOpenChange(false);
      setLocation(notification.actionUrl);
    }
  };

  // Icona in base al tipo di notifica
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'match':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'tournament':
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'payment':
        return <CreditCard className="h-5 w-5 text-green-500" />;
      case 'referral':
        return <UserPlus className="h-5 w-5 text-purple-500" />;
      case 'system':
        return <Bell className="h-5 w-5 text-gray-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">Notifiche</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-2">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-52 p-4 text-center">
              <Bell className="h-10 w-10 text-gray-300 mb-3" />
              <h3 className="text-gray-700 font-medium">Nessuna notifica</h3>
              <p className="text-gray-500 text-sm mt-1">
                Non hai nuove notifiche al momento
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`
                    relative p-3 hover:bg-gray-50 rounded-md transition-colors 
                    ${notification.read ? 'opacity-80' : 'bg-blue-50/50'}
                    ${notification.actionUrl ? 'cursor-pointer' : ''}
                  `}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className={`text-sm font-medium text-gray-900 ${!notification.read ? 'font-semibold' : ''}`}>
                          {notification.title}
                        </p>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {typeof notification.timestamp === 'string' 
                              ? notification.timestamp 
                              : new Date(notification.timestamp).toLocaleString('it-IT', { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  day: '2-digit',
                                  month: '2-digit',
                                })
                            }
                          </span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      {notification.actionUrl && (
                        <div className="mt-1">
                          <span className="text-xs text-blue-600 font-medium">
                            Tocca per maggiori dettagli
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="border-t pt-2 flex justify-between items-center">
          <span className="text-xs text-gray-500">
            {notifications.filter(n => !n.read).length} non lette
          </span>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-8" 
              onClick={() => clearAll()}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Elimina tutte
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="text-xs h-8 bg-primary text-white hover:bg-primary/90"
              onClick={() => setLocation('/settings/notifications')}
            >
              <Bell className="h-3.5 w-3.5 mr-1" />
              Impostazioni
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsPanel;