import { FC, useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  BookOpen,
  Settings,
  FileQuestion,
  Mail,
  ChevronRight,
  Menu,
  X,
  LogOut
} from 'lucide-react';

interface HamburgerMenuProps {
  className?: string;
}

const HamburgerMenu: FC<HamburgerMenuProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const [, navigate] = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  
  // Menu items for all users (guest and logged in)
  const menuItems = [
    {
      icon: <HelpCircle className="w-5 h-5 text-primary" />,
      label: 'Assistenza',
      path: '/support/assistenza'
    },
    {
      icon: <FileQuestion className="w-5 h-5 text-primary" />,
      label: 'FAQ',
      path: '/support/faq'
    },
    {
      icon: <BookOpen className="w-5 h-5 text-primary" />,
      label: 'Regolamento e Policy',
      path: '/support/regolamento'
    }
  ];
  
  // Items only for logged in users - ONLY Impostazioni, NO Logout
  const userMenuItems = user ? [
    {
      icon: <Settings className="w-5 h-5 text-primary" />,
      label: 'Impostazioni',
      path: '/settings'
    }
  ] : [];

  // Chiude il menu quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Chiudi il menu quando cambia la route
  useEffect(() => {
    setIsOpen(false);
  }, [useLocation()[0]]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleMenu}
        className="p-1 flex items-center justify-center text-white"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.2 }}
            className="absolute top-14 left-0 w-[280px] h-[calc(100vh-60px)] bg-primary-foreground shadow-lg rounded-r-lg z-50"
          >
            <div className="flex flex-col h-full">
              {/* Menu Header */}
              <div className="p-6 bg-primary text-white rounded-tr-lg">
                <h3 className="text-lg font-semibold">Menu</h3>
              </div>
              
              {/* Menu Items */}
              <div className="flex-1 overflow-auto py-4">
                <div className="space-y-2 px-4">
                  {/* Render base menu items */}
                  {menuItems.map((item, index) => (
                    <div key={index}>
                      <a
                        href="#"
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          handleItemClick(item.path);
                        }}
                      >
                        <div className="flex items-center">
                          {item.icon}
                          <span className="ml-3 text-sm font-medium text-gray-800">
                            {item.label}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </a>
                    </div>
                  ))}
                  
                  {/* Render user menu items if logged in */}
                  {userMenuItems.map((item, index) => (
                    <a
                      key={`user-${index}`}
                      href="#"
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        handleItemClick(item.path);
                      }}
                    >
                      <div className="flex items-center">
                        {item.icon}
                        <span className="ml-3 text-sm font-medium text-gray-800">
                          {item.label}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HamburgerMenu;