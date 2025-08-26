import React from 'react';

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  return (
    <div className={`text-center text-2xl font-bold mb-4 ${className}`}>
      {children}
    </div>
  );
};

export default CardHeader;