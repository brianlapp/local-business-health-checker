
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserMenu } from './UserMenu';
import { Button } from './ui/button';

const Header: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="w-full bg-background shadow-sm py-4 mb-6">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="text-xl font-bold">
            Freelance Opportunity Finder
          </Link>
        </div>

        {user ? (
          <>
            <nav className="hidden md:flex items-center space-x-4">
              <Link to="/dashboard" className={`text-sm ${isActive('/dashboard') ? 'font-bold' : ''}`}>
                Dashboard
              </Link>
              <Link to="/opportunities" className={`text-sm ${isActive('/opportunities') ? 'font-bold' : ''}`}>
                Opportunities
              </Link>
              <Link to="/job-board" className={`text-sm ${isActive('/job-board') ? 'font-bold' : ''}`}>
                Job Board
              </Link>
              <Link to="/map-scanner" className={`text-sm ${isActive('/map-scanner') ? 'font-bold' : ''}`}>
                Map Scanner
              </Link>
              <Link to="/agency-analysis" className={`text-sm ${isActive('/agency-analysis') ? 'font-bold' : ''}`}>
                Agency Finder
              </Link>
              <Link to="/agency-relationships" className={`text-sm ${isActive('/agency-relationships') ? 'font-bold' : ''}`}>
                Relationships
              </Link>
              <Link to="/scan-manager" className={`text-sm ${isActive('/scan-manager') ? 'font-bold' : ''}`}>
                Scan Manager
              </Link>
              <Link to="/outreach-manager" className={`text-sm ${isActive('/outreach-manager') ? 'font-bold' : ''}`}>
                Outreach
              </Link>
            </nav>
            <UserMenu user={user} logout={useAuth().signOut} />
          </>
        ) : (
          <Link to="/auth">
            <Button>Login</Button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
