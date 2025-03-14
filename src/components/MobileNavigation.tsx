
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { X } from 'lucide-react';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background md:hidden">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2" onClick={onClose}>
          <span className="text-xl font-bold">Freelance Finder</span>
        </Link>
        <button
          onClick={onClose}
          className="rounded-full p-2 text-muted-foreground hover:bg-muted"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <nav className="container grid gap-6 pb-8">
        {user && (
          <>
            <Link
              to="/dashboard"
              onClick={onClose}
              className={`flex items-center gap-2 text-lg font-medium ${
                location.pathname === "/dashboard" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/opportunities"
              onClick={onClose}
              className={`flex items-center gap-2 text-lg font-medium ${
                location.pathname === "/opportunities" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Opportunities
            </Link>
            <Link
              to="/job-board"
              onClick={onClose}
              className={`flex items-center gap-2 text-lg font-medium ${
                location.pathname === "/job-board" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Job Board
            </Link>
            <Link
              to="/map-scanner"
              onClick={onClose}
              className={`flex items-center gap-2 text-lg font-medium ${
                location.pathname === "/map-scanner" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Map Scanner
            </Link>
            <Link
              to="/profile"
              onClick={onClose}
              className={`flex items-center gap-2 text-lg font-medium ${
                location.pathname === "/profile" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Profile
            </Link>
          </>
        )}
        {!user && (
          <Link
            to="/auth"
            onClick={onClose}
            className="flex items-center gap-2 text-lg font-medium"
          >
            Login / Register
          </Link>
        )}
      </nav>
    </div>
  );
};
