
import React from 'react';
import { Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchButtonProps {
  isLoading: boolean;
}

const SearchButton: React.FC<SearchButtonProps> = ({ isLoading }) => {
  return (
    <Button 
      type="submit" 
      className="w-full" 
      disabled={isLoading}
      size="lg"
    >
      {isLoading ? (
        <>Searching...</>
      ) : (
        <>
          <Briefcase className="mr-2 h-4 w-4" />
          Find Opportunities
        </>
      )}
    </Button>
  );
};

export default SearchButton;
