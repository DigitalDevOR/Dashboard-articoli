import { FC, ReactNode } from 'react';
import { useLocation } from 'wouter';

interface BottomNavigationProps {
  activeItem?: 'home' | 'sport' | 'casino' | 'profile' | 'calendario';
  topComponent?: ReactNode;
}

const BottomNavigation: FC<BottomNavigationProps> = ({ activeItem = undefined, topComponent }) => {
  const [, setLocation] = useLocation();

  const navItems = [
    { name: 'home', icon: 'ri-home-4-line', label: 'Home', path: '/' },
    { name: 'sport', icon: 'ri-trophy-line', label: 'Tornei', path: '/sports' },
    /* { name: 'news', icon: 'ri-file-list-3-line', label: 'News partite', path: '/news-partite' }, */
    { name: 'profile', icon: 'ri-user-line', label: 'Profilo', path: '/profile' },
  ];

  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center justify-center w-full">
      {topComponent ? topComponent : null}
      <div className="w-full bg-[#112244] border-gray-700  border-t text-white">
        <div className='flex justify-around w-full max-w-5xl py-2 mx-auto'>
          {navItems.map((item) => {
            const isActive = activeItem === item.name ||
              (activeItem === undefined && location === item.path);

            return (
              <a
                key={item.name}
                href="#"
                className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setLocation(item.path);
                }}
              >
                <i className={`${item.icon} text-xl`}></i>
                <span className="mt-1 text-xs">{item.label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;
