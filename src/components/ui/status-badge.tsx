
import React from 'react';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { Icons } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

type StatusType = 'success' | 'error' | 'warning' | 'info' | 'default' | 'pending' | 'scanning';

interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: StatusType;
  text?: string;
  showIcon?: boolean;
}

const getStatusConfig = (status: StatusType) => {
  switch (status) {
    case 'success':
      return {
        variant: 'success' as const,
        icon: Icons.checkCircle,
        text: 'Success'
      };
    case 'error':
      return {
        variant: 'danger' as const,
        icon: Icons.error,
        text: 'Error'
      };
    case 'warning':
      return {
        variant: 'warning' as const,
        icon: Icons.warning,
        text: 'Warning'
      };
    case 'info':
      return {
        variant: 'info' as const,
        icon: Icons.alert,
        text: 'Info'
      };
    case 'pending':
      return {
        variant: 'secondary' as const,
        icon: Icons.clock,
        text: 'Pending'
      };
    case 'scanning':
      return {
        variant: 'info' as const,
        icon: Icons.spinner,
        text: 'Scanning'
      };
    default:
      return {
        variant: 'default' as const,
        icon: Icons.alert,
        text: 'Default'
      };
  }
};

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  text,
  showIcon = true,
  className,
  ...props
}) => {
  const config = getStatusConfig(status);
  const Icon = config.icon;
  
  return (
    <Badge 
      variant={config.variant} 
      className={cn('flex items-center gap-1', className)} 
      {...props}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      <span>{text || config.text}</span>
    </Badge>
  );
};

export { StatusBadge };
export type { StatusType };
