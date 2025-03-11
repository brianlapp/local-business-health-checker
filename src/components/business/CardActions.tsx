
import React from 'react';
import { Button } from '@/components/ui/button';
import { Business } from '@/types/business';
import EmailGenerator from './EmailGenerator';

interface CardActionsProps {
  business: Business;
}

const CardActions: React.FC<CardActionsProps> = ({ business }) => {
  const handleReviewWebsite = () => {
    window.open(`https://${business.website}`, '_blank');
  };

  return (
    <div className="mt-6 flex justify-end space-x-3">
      <Button variant="outline" onClick={handleReviewWebsite}>
        Review Website
      </Button>
      <EmailGenerator business={business} />
    </div>
  );
};

export default CardActions;
