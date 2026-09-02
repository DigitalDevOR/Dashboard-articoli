import { FC, ReactNode } from 'react';

interface SettingsMenuItemProps {
  icon: string;
  label: string;
  color?: string;
  onClick: () => void;
  isLast?: boolean;
}

const SettingsMenuItem: FC<SettingsMenuItemProps> = ({
  icon,
  label,
  color = 'text-primary',
  onClick,
  isLast = false
}) => {
  return (
    <a
      href="#"
      className={`p-4 flex items-center justify-between ${
        !isLast ? 'border-b border-gray-100' : ''
      }`}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      <div className="flex items-center">
        <i className={`${icon} text-lg ${color} mr-3`}></i>
        <span className={color}>{label}</span>
      </div>
      <i className="ri-arrow-right-s-line text-gray-400"></i>
    </a>
  );
};

export default SettingsMenuItem;
