import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { Switch } from "@/components/ui/switch";
import { 
  Bell, 
  Calendar, 
  Trophy, 
  CreditCard, 
  UserPlus
} from 'lucide-react';

const NotificationsPage: React.FC = () => {
  // State per le impostazioni delle notifiche
  const [notifications, setNotifications] = useState({
    allNotifications: true,
    matchResults: true,
    newTournaments: true,
    payments: true,
    referrals: true,
  });

  const handleToggle = (key: keyof typeof notifications) => {
    if (key === 'allNotifications') {
      const newValue = !notifications.allNotifications;
      setNotifications({
        allNotifications: newValue,
        matchResults: newValue,
        newTournaments: newValue,
        payments: newValue,
        referrals: newValue,
      });
    } else {
      setNotifications(prev => {
        const updated = { ...prev, [key]: !prev[key] };
        
        // Check if all specific notifications are enabled/disabled
        const specificNotifications = Object.entries(updated)
          .filter(([k]) => k !== 'allNotifications')
          .map(([, value]) => value);
        
        const allEnabled = specificNotifications.every(value => value === true);
        const allDisabled = specificNotifications.every(value => value === false);
        
        if (allEnabled) {
          updated.allNotifications = true;
        } else if (allDisabled) {
          updated.allNotifications = false;
        }
        
        return updated;
      });
    }
  };

  const notificationSettings = [
    {
      id: 'allNotifications',
      label: 'Tutte le notifiche',
      description: 'Attiva o disattiva tutte le notifiche',
      icon: <Bell className="h-5 w-5 text-primary" />,
      value: notifications.allNotifications,
    },
    {
      id: 'matchResults',
      label: 'Risultati partite',
      description: 'Ricevi notifiche sui risultati delle partite',
      icon: <Calendar className="h-5 w-5 text-primary" />,
      value: notifications.matchResults,
      disabled: !notifications.allNotifications,
    },
    {
      id: 'newTournaments',
      label: 'Nuovi tornei',
      description: 'Ricevi notifiche quando vengono aggiunti nuovi tornei',
      icon: <Trophy className="h-5 w-5 text-primary" />,
      value: notifications.newTournaments,
      disabled: !notifications.allNotifications,
    },
    {
      id: 'payments',
      label: 'Pagamenti',
      description: 'Ricevi notifiche sui pagamenti e transazioni',
      icon: <CreditCard className="h-5 w-5 text-primary" />,
      value: notifications.payments,
      disabled: !notifications.allNotifications,
    },
    {
      id: 'referrals',
      label: 'Inviti amici',
      description: 'Ricevi notifiche quando un amico si unisce',
      icon: <UserPlus className="h-5 w-5 text-primary" />,
      value: notifications.referrals,
      disabled: !notifications.allNotifications,
    },

  ];

  return (
    <div className="page-container">
      <Header title="Notifiche" showBackButton backDestination="/settings" />
      
      <div className="p-4 flex-1 bg-gray-50">
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="divide-y">
              {notificationSettings.map((setting) => (
                <div
                  key={setting.id}
                  className={`flex items-center justify-between p-4 ${
                    setting.disabled ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className="mr-4 mt-1">{setting.icon}</div>
                    <div>
                      <h3 className="font-medium text-gray-800">{setting.label}</h3>
                      <p className="text-xs text-gray-500">{setting.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={setting.value}
                    disabled={setting.disabled && setting.id !== 'allNotifications'}
                    onCheckedChange={() => handleToggle(setting.id as keyof typeof notifications)}
                    className="data-[state=checked]:bg-secondary"
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-xs text-center text-gray-500 mt-4">
            <p>
              Puoi personalizzare ulteriormente le notifiche nelle impostazioni del tuo dispositivo
            </p>
          </div>
        </div>
      </div>
      
      <BottomNavigation activeItem="home" />
    </div>
  );
};

export default NotificationsPage;