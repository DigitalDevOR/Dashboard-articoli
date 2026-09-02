import { FC } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { motion } from 'framer-motion';
import {
  User,
  Bell,
  Monitor,
  LogOut,
  Trash2,
  ChevronRight
} from 'lucide-react';

const SettingsPage: FC = () => {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  // Visualizza una versione limitata della pagina se non c'è l'utente invece di 404
  // Questo permette di visualizzare comunque la pagina anche in caso di problemi di autenticazione

  interface SettingItem {
    icon: React.ReactNode;
    label: string;
    path: string;
    danger?: boolean;
  }
  
  interface SettingGroup {
    title: string;
    items: SettingItem[];
  }
  
  const settingsGroups: SettingGroup[] = [
    {
      title: 'Profilo',
      items: [
        {
          icon: <User size={20} className="text-primary" />,
          label: 'Dati utente',
          path: '/settings/profile'
        }
      ]
    },
    {
      title: 'Preferenze',
      items: [
        {
          icon: <Bell size={20} className="text-primary" />,
          label: 'Notifiche',
          path: '/settings/notifications'
        },
        {
          icon: <Monitor size={20} className="text-primary" />,
          label: 'Schermo',
          path: '/settings/display'
        }
      ]
    },
    {
      title: 'Account',
      items: [
        {
          icon: <Trash2 size={20} className="text-destructive" />,
          label: 'Cancella account',
          path: '/settings/delete-account',
          danger: true
        },
        {
          icon: <LogOut size={20} className="text-destructive" />,
          label: 'Logout',
          path: '/settings/logout',
          danger: true
        }
      ]
    }
  ];

  const handleSettingClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <Header title="Impostazioni" showBackButton={true} backDestination="/" />

      <motion.div
        className="flex-1 p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {settingsGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-6">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 px-1">
              {group.title}
            </h2>
            <div className="bg-white rounded-lg overflow-hidden shadow-sm divide-y divide-gray-100">
              {group.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  onClick={() => handleSettingClick(item.path)}
                >
                  <div className="flex items-center">
                    {item.icon}
                    <span className={`ml-3 ${item.danger ? 'text-destructive' : 'text-gray-800'}`}>
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="text-center mt-6 text-xs text-gray-500">
          <p>Versione app: 1.0.0</p>
          <p className="mt-1">© 2025 Bet Master League</p>
        </div>
      </motion.div>

      <BottomNavigation />
    </div>
  );
};

export default SettingsPage;