
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Business } from '@/types/business';
import { Opportunity } from '@/types/opportunity';
import { TargetSelector } from '@/components/outreach/proposal/TargetSelector';
import EmailComposer from './EmailComposer';
import EmailTemplateManager from './EmailTemplateManager';

interface EmailOutreachProps {
  businesses: Business[];
  opportunities: Opportunity[];
  selectedTarget: Business | Opportunity | null;
  onSelectTarget: (target: Business | Opportunity | null) => void;
  loading: boolean;
}

const EmailOutreach: React.FC<EmailOutreachProps> = ({
  businesses,
  opportunities,
  selectedTarget,
  onSelectTarget,
  loading,
}) => {
  const [activeTab, setActiveTab] = useState('compose');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left column: Target selection */}
      <Card className="md:col-span-1">
        <CardContent className="p-4">
          <TargetSelector
            businesses={businesses}
            opportunities={opportunities}
            selectedTarget={selectedTarget}
            onSelectTarget={onSelectTarget}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Right column: Email outreach functionality */}
      <div className="md:col-span-2">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="compose">Compose Email</TabsTrigger>
            <TabsTrigger value="templates">Manage Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="compose">
            <EmailComposer target={selectedTarget} />
          </TabsContent>

          <TabsContent value="templates">
            <EmailTemplateManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EmailOutreach;
