
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Map, Plus, Briefcase } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold mr-8">Freelance Finder</h1>
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
        </div>
        <div className="flex items-center">
          {/* Future auth or profile controls would go here */}
        </div>
      </div>
    </header>
  );
};

export default Header;
