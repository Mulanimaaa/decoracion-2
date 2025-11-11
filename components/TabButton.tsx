import React from 'react';

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  notification?: boolean;
}

export const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick, icon, notification }) => {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg'
          : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
      }`}
    >
      {icon}
      <span className="hidden md:inline font-medium">{label}</span>
      {notification && (
        <span className="absolute top-2 right-2 md:top-3 md:right-3 w-2 h-2 bg-red-500 rounded-full"></span>
      )}
    </button>
  );
};