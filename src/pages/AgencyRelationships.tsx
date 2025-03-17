
import React from 'react';
import RelationshipMap from '@/components/agency/relationship-map/RelationshipMap';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, MapIcon } from 'lucide-react';

const AgencyRelationships: React.FC = () => {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Agency Relationships</h1>
        <p className="text-muted-foreground mb-6">
          Map and visualize relationships between agencies and their clients
        </p>
        
        <Alert className="mb-6">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>About Agency Relationships</AlertTitle>
          <AlertDescription>
            This tool helps you identify which clients are working with which agencies. 
            It can help you find potential clients by analyzing competitor agencies and their portfolios.
            Start by analyzing agency websites in the Agency Analysis section.
          </AlertDescription>
        </Alert>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        <RelationshipMap />
        
        <div className="flex justify-center mt-4">
          <Button variant="outline" className="mr-4" asChild>
            <a href="/agency-analysis">
              <MapIcon className="mr-2 h-4 w-4" />
              Analyze More Agencies
            </a>
          </Button>
          
          <Button variant="outline" asChild>
            <a href="/scan-manager">
              Scan Manager
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AgencyRelationships;
