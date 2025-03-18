
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserMenu } from './UserMenu';
import MobileNavigation from './MobileNavigation';
import { Button } from './ui/button';
import { Menu } from 'lucide-react';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">Freelance Finder</span>
          </Link>
          {user && (
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === "/dashboard" ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/opportunities"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === "/opportunities" ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Opportunities
              </Link>
              <Link
                to="/job-board"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === "/job-board" || location.pathname === "/jobs" ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Job Board
              </Link>
              <Link
                to="/map-scanner"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === "/map-scanner" ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Map Scanner
              </Link>
            </nav>
          )}
        </div>
        
        {user ? (
          <UserMenu user={user} logout={signOut} />
        ) : (
          <Link to="/auth">
            <Button variant="default">Login</Button>
          </Link>
        )}

        <Button
          variant="outline"
          className="md:hidden"
          onClick={toggleMobileMenu}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>
      
      <MobileNavigation isOpen={isMobileMenuOpen} onClose={toggleMobileMenu} />
    </header>
  );
};

export default Header;
