
import React from 'react';
import { Business } from '@/types/business';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Globe, ExternalLink, Network, Plus } from 'lucide-react';

interface ClientCardProps {
  client: Business;
  isAddedToOpportunities: boolean;
  isAddedToRelationships: boolean;
  onAddToOpportunities: (client: Business) => void;
  onMapRelationship?: () => void;
  agencyId?: string;
}

const ClientCard: React.FC<ClientCardProps> = ({
  client,
  isAddedToOpportunities,
  isAddedToRelationships,
  onAddToOpportunities,
  onMapRelationship,
  agencyId
}) => {
  return (
    <Card className="p-4">
      <div className="flex justify-between">
        <div>
          <h3 className="font-semibold">{client.name}</h3>
          {client.website && (
            <a 
              href={client.website.startsWith('http') ? client.website : `https://${client.website}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-500 flex items-center mt-1"
            >
              <Globe className="w-3 h-3 mr-1" />
              {client.website}
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              {client.source?.replace('agency-portfolio', 'portfolio')}
            </Badge>
            
            {agencyId && isAddedToRelationships && (
              <Badge variant="secondary" className="text-xs">
                <Network className="w-3 h-3 mr-1" />
                Relationship Mapped
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {agencyId && onMapRelationship && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={onMapRelationship}
              disabled={isAddedToRelationships}
            >
              {isAddedToRelationships ? (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  Mapped
                </>
              ) : (
                <>
                  <Network className="w-3 h-3 mr-1" />
                  Map
                </>
              )}
            </Button>
          )}
          
          <Button 
            size="sm"
            variant={isAddedToOpportunities ? "outline" : "default"}
            onClick={() => onAddToOpportunities(client)}
            disabled={isAddedToOpportunities}
          >
            {isAddedToOpportunities ? (
              <>
                <Check className="w-3 h-3 mr-1" />
                Added
              </>
            ) : (
              <>
                <Plus className="w-3 h-3 mr-1" />
                Add
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ClientCard;
