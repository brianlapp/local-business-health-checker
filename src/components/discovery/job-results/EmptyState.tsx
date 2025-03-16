
import React from 'react';

const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-10">
      <h3 className="text-lg font-medium">No jobs found</h3>
      <p className="text-muted-foreground mt-2">Try adjusting your search terms or location.</p>
    </div>
  );
};

export default EmptyState;
