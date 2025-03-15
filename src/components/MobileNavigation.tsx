
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, PlusCircle, MapPin, Briefcase, Folder, Settings, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const MobileNavigation = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  if (!user) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border md:hidden z-50">
      <nav className="container mx-auto">
        <ul className="flex justify-around p-2">
          <NavItem 
            to="/dashboard" 
            icon={<Home className="w-5 h-5" />} 
            label="Dashboard" 
            isActive={location.pathname === '/dashboard'} 
          />
          <NavItem 
            to="/add-business" 
            icon={<PlusCircle className="w-5 h-5" />} 
            label="Add" 
            isActive={location.pathname === '/add-business'} 
          />
          <NavItem 
            to="/map-scanner" 
            icon={<MapPin className="w-5 h-5" />} 
            label="Map" 
            isActive={location.pathname === '/map-scanner'} 
          />
          <NavItem 
            to="/jobs" 
            icon={<Briefcase className="w-5 h-5" />} 
            label="Jobs" 
            isActive={location.pathname === '/jobs'} 
          />
          <NavItem 
            to="/opportunities" 
            icon={<Folder className="w-5 h-5" />} 
            label="Leads" 
            isActive={location.pathname === '/opportunities'} 
          />
          <NavItem 
            to="/agency-analysis" 
            icon={<Users className="w-5 h-5" />} 
            label="Agencies" 
            isActive={location.pathname === '/agency-analysis'} 
          />
        </ul>
      </nav>
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isActive }) => {
  return (
    <li>
      <NavLink 
        to={to} 
        className={({ isActive }) => cn(
          "flex flex-col items-center text-center py-1 px-2 rounded-md",
          isActive ? "text-primary" : "text-muted-foreground"
        )}
      >
        {icon}
        <span className="text-xs mt-1">{label}</span>
      </NavLink>
    </li>
  );
};

export default MobileNavigation;
