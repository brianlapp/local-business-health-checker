
import React from 'react';
import { cn } from '@/lib/utils';
import { Search, Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
        
        <div className="max-w-md w-full hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search businesses..." 
              className="pl-10 w-full bg-secondary border-none focus-visible:ring-1"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Button className="hidden sm:flex">
            New Scan
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
