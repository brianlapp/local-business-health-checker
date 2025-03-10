
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Business } from '@/types/business';

interface DashboardStatsProps {
  businesses: Business[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ businesses }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="animate-fade-in delay-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Businesses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{businesses.length}</div>
        </CardContent>
      </Card>
      
      <Card className="animate-fade-in delay-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Shit Score™</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {businesses.length > 0 
              ? Math.round(businesses.reduce((acc, cur) => acc + cur.score, 0) / businesses.length) 
              : 0}
          </div>
        </CardContent>
      </Card>
      
      <Card className="animate-fade-in delay-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Critical Sites</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{businesses.filter(b => b.score >= 80).length}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
