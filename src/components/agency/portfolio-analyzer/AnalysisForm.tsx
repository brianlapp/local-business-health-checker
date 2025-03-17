
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onAnalyze(websiteUrl);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-background to-accent/5">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter agency website URL"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-9"
                disabled={isAnalyzing}
              />
              {initialWebsite && (
                <Badge variant="outline" className="absolute right-3 top-1/2 -translate-y-1/2">
                  Pre-filled
                </Badge>
              )}
            </div>
            <Button type="submit" disabled={isAnalyzing} className="min-w-24">
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p>Enter the URL of an agency website to analyze their portfolio and discover potential clients.</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AnalysisForm;
