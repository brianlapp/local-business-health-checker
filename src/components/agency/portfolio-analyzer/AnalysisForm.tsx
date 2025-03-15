
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

interface AnalysisFormProps {
  initialWebsite?: string;
  isAnalyzing: boolean;
  onAnalyze: (websiteUrl: string) => void;
}

const AnalysisForm: React.FC<AnalysisFormProps> = ({
  initialWebsite = '',
  isAnalyzing,
  onAnalyze
}) => {
  const [websiteUrl, setWebsiteUrl] = useState(initialWebsite);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze(websiteUrl);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Enter agency website URL"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          className="flex-1"
          disabled={isAnalyzing}
        />
        <Button type="submit" disabled={isAnalyzing}>
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze'
          )}
        </Button>
      </div>
    </form>
  );
};

export default AnalysisForm;
