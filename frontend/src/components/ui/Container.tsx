// src/components/ui/Container.tsx
import React from 'react';

type ContainerProps = {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
};

export const Container: React.FC<ContainerProps> = ({ 
  children, 
  size = 'lg', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    full: 'max-w-full',
  };
  
  return (
    <div className={`mx-auto px-4 w-full ${sizeClasses[size]} ${className}`}>
      {children}
    </div>
  );
};