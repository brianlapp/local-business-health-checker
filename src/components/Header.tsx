
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Bell, Settings, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header className={cn('border-b bg-white sticky top-0 z-10', className)}>
      <div className="container py-4 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
              BizScan
            </span>
            <span className="text-xs text-muted-foreground ml-2">BETA</span>
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Link to="/map-scanner">
            <Button className="hidden sm:flex">
              <Map className="mr-2 h-4 w-4" />
              Scan Area
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
