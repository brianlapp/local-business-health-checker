
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Map, 
  Plus, 
  Briefcase, 
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Header: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const userInitials = user?.user_metadata?.full_name 
    ? getInitials(user.user_metadata.full_name) 
    : user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold mr-8">Freelance Finder</h1>
          {user && (
            <nav className="hidden md:flex space-x-4">
              <Link to="/">
                <Button variant={isActive('/') ? 'default' : 'ghost'} className="flex items-center">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/opportunities">
                <Button variant={isActive('/opportunities') ? 'default' : 'ghost'} className="flex items-center">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Opportunities
                </Button>
              </Link>
              <Link to="/map-scanner">
                <Button variant={isActive('/map-scanner') ? 'default' : 'ghost'} className="flex items-center">
                  <Map className="mr-2 h-4 w-4" />
                  Map Scanner
                </Button>
              </Link>
              <Link to="/add-business">
                <Button variant={isActive('/add-business') ? 'default' : 'ghost'} className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Business
                </Button>
              </Link>
            </nav>
          )}
        </div>
        <div className="flex items-center">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
