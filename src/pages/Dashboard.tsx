
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, ArrowRight, Calendar, Clock, Users, BriefcaseIcon } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.email || 'User'}! Here's an overview of your opportunities.
        </p>
      </div>
      
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="animate-fade-in delay-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in delay-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saved Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in delay-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Agencies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in delay-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0%</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Opportunities */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Opportunities</CardTitle>
              <Link to="/opportunities">
                <Button variant="outline" size="sm">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <CardDescription>Your latest opportunity leads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-muted-foreground">
              <BriefcaseIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No opportunities yet</p>
              <Link to="/opportunities/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" /> Add Opportunity
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Upcoming Follow-ups</CardTitle>
              <Button variant="outline" size="sm">
                View Calendar <Calendar className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <CardDescription>Scheduled follow-ups and reminders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No upcoming follow-ups</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Discovery Tools */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Opportunity Discovery</CardTitle>
            <CardDescription>Find potential clients and opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/job-board">
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <Search className="h-8 w-8 mb-2 mt-2" />
                    <h3 className="font-medium">Job Board Scanner</h3>
                    <p className="text-sm text-muted-foreground">Search job listings across platforms</p>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/map-scanner">
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <Users className="h-8 w-8 mb-2 mt-2" />
                    <h3 className="font-medium">Agency Finder</h3>
                    <p className="text-sm text-muted-foreground">Discover recruitment agencies</p>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/businesses">
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <BriefcaseIcon className="h-8 w-8 mb-2 mt-2" />
                    <h3 className="font-medium">Local Business Scanner</h3>
                    <p className="text-sm text-muted-foreground">Find potential clients in your area</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
