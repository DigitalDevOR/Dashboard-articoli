import { FC, useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Logo from '@/components/common/Logo';
import HamburgerMenu from './HamburgerMenu';
import { Bell } from 'lucide-react';
import NotificationsPanel from '@/components/layout/NotificationsPanel';
import { useNotifications } from '@/components/providers/NotificationProvider';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  showLogo?: boolean;
  showMenu?: boolean;
  showNotification?: boolean;
  onBackClick?: () => void;
  backDestination?: string;
  leftElement?: React.ReactNode;
}

const Header: FC<HeaderProps> = ({
  title,
  showBackButton = false,
  showLogo = true,
  showMenu = true,
  showNotification = true,
  onBackClick,
  backDestination = '/',
  leftElement,
}) => {
  const [, setLocation] = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { unreadCount, markAllAsRead } = useNotifications();
  const { user } = useAuth();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else if (backDestination) {
      setLocation(backDestination);
    }
  };

  const toggleNotifications = () => {
    const newState = !notificationsOpen;
    setNotificationsOpen(newState);
    if (newState) {
      markAllAsRead();
    }
  };

  return (
    <div className="w-full app-header">
      <div className="relative flex items-center justify-between w-full max-w-5xl mx-auto">
        {/* Elemento sinistro: pulsante indietro o menu hamburger */}
        <div className="flex items-center justify-start w-1/3">
          {leftElement}

          {showBackButton && !leftElement && (
            <button className="mr-3 text-white" onClick={handleBackClick}>
              <i className="text-xl ri-arrow-left-line"></i>
            </button>
          )}

          {!showBackButton && showMenu && !leftElement && (
            <HamburgerMenu className="mr-3" />
          )}
        </div>

        {/* Elemento centrale: logo o titolo */}
        <div className="absolute inset-x-0 flex items-center justify-center pointer-events-none">
          {showLogo && <div className="pointer-events-auto"><Logo showFullLogo={false} /></div>}
          {title && <span className="font-semibold text-white pointer-events-auto">{title}</span>}
        </div>

        {/* Elemento destro: notifiche */}
        <div className="flex items-center justify-end w-1/3">
          {showNotification && user && (
            <div className="relative">
              <button
                className="flex items-center justify-center p-1 text-white"
                onClick={toggleNotifications}
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full -top-1 -right-1 bg-secondary text-primary">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <NotificationsPanel
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
    </div>
  );
};

export default Header;
