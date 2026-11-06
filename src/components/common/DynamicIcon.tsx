import React from 'react';
import * as LucideIcons from 'lucide-react';

interface DynamicIconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ 
  name, 
  size = 16, 
  color, 
  strokeWidth = 2,
  className 
}) => {
  const IconComponent = (LucideIcons as any)[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return null;
  }
  
  return <IconComponent size={size} color={color} strokeWidth={strokeWidth} className={className} />;
};

export default DynamicIcon;
