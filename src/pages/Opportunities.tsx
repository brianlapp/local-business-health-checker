
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Opportunities: React.FC = () => {
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Opportunities</h1>
          <p className="text-muted-foreground">
            Manage and track your potential client opportunities
          </p>
        </div>
        
        <Link to="/opportunities/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Opportunity
          </Button>
        </Link>
      </div>
      
      <div className="text-center py-16 text-muted-foreground">
        <p className="mb-4">No opportunities found</p>
        <p className="mb-8">Start adding opportunities or use our discovery tools to find potential clients</p>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/opportunities/new">
            <Button variant="default">
              <Plus className="mr-2 h-4 w-4" />
              Add Manually
            </Button>
          </Link>
          
          <Link to="/job-board">
            <Button variant="outline">
              Browse Job Board
            </Button>
          </Link>
          
          <Link to="/map-scanner">
            <Button variant="outline">
              Find Agencies
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Opportunities;
