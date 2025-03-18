
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TemplatesList from '@/components/outreach/TemplatesList';
import TemplateEditor from '@/components/outreach/TemplateEditor';
import { ProposalTemplate } from '@/services/outreach/templateService';
import { ScrollArea } from '@/components/ui/scroll-area';

const OutreachManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [editingTemplate, setEditingTemplate] = useState<ProposalTemplate | undefined>(undefined);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  
  const handleEditTemplate = (template: ProposalTemplate) => {
    setEditingTemplate(template);
    setIsCreatingTemplate(true);
  };
  
  const handleCreateTemplate = () => {
    setEditingTemplate(undefined);
    setIsCreatingTemplate(true);
  };
  
  const handleTemplateSaved = () => {
    setIsCreatingTemplate(false);
    setEditingTemplate(undefined);
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Outreach Manager</h1>
      
      <Tabs 
        defaultValue="templates" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Proposal Templates</TabsTrigger>
          <TabsTrigger value="emails">Email Campaigns</TabsTrigger>
          <TabsTrigger value="follow-ups">Follow-Ups</TabsTrigger>
        </TabsList>
        
        <TabsContent value="templates" className="pt-4">
          <ScrollArea className="h-[calc(100vh-220px)]">
            {isCreatingTemplate ? (
              <TemplateEditor 
                template={editingTemplate}
                onSave={handleTemplateSaved}
                onCancel={() => setIsCreatingTemplate(false)}
              />
            ) : (
              <TemplatesList 
                onEditTemplate={handleEditTemplate}
                onCreateTemplate={handleCreateTemplate}
              />
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="emails" className="pt-4">
          <div className="flex items-center justify-center h-[400px] border rounded-md">
            <div className="text-center">
              <h3 className="text-lg font-medium">Email Campaigns Management</h3>
              <p className="text-muted-foreground mt-2">
                This feature is coming soon in an upcoming release
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="follow-ups" className="pt-4">
          <div className="flex items-center justify-center h-[400px] border rounded-md">
            <div className="text-center">
              <h3 className="text-lg font-medium">Follow-Ups Management</h3>
              <p className="text-muted-foreground mt-2">
                This feature is coming soon in an upcoming release
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OutreachManager;
