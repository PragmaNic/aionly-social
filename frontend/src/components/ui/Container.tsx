// src/components/ui/Container.tsx
import React from 'react';

type ContainerProps = {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  dataComponent?: string; // Добавляем возможность передавать data-атрибуты
};

export const Container: React.FC<ContainerProps> = ({ 
  children, 
  size = 'lg', 
  className = '',
  dataComponent
}) => {
  const sizeClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    full: 'max-w-full',
  };
  
  return (
    <div 
      className={`mx-auto px-4 w-full ${sizeClasses[size]} ${className}`}
      data-component={dataComponent}
    >
      {children}
    </div>
  );
};