
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const JobBoard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement job search functionality
    console.log('Searching for:', searchQuery, 'in', location);
  };
  
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Job Board</h1>
        <p className="text-muted-foreground">
          Search for freelance opportunities across multiple job platforms
        </p>
      </div>
      
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Skills, keywords, job titles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Location (optional)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Button type="submit">
            <Search className="mr-2 h-4 w-4" />
            Search Jobs
          </Button>
        </div>
      </form>
      
      <div className="text-center py-16 text-muted-foreground">
        <p>Enter search terms above to find freelance opportunities</p>
      </div>
    </div>
  );
};

export default JobBoard;
