// src/components/ui/Icon.tsx
import React from 'react';

// Define a union type of all available icon names
type IconName = 'check' | 'alert' | 'info' /* other icon names */;

type IconProps = {
  icon: IconName;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
};

// Define the paths with proper type
const iconPaths: Record<IconName, string> = {
  check: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z",
  alert: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z",
  info: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
  // Add other icon paths as needed
};

const sizeClasses: Record<string, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export const Icon: React.FC<IconProps> = ({ 
  icon, 
  size = 'md', 
  className = '' 
}) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 20 20" 
      fill="currentColor"
      className={`${sizeClasses[size]} ${className}`}
      aria-hidden="true"
    >
      <path fillRule="evenodd" d={iconPaths[icon]} clipRule="evenodd" />
    </svg>
  );
};