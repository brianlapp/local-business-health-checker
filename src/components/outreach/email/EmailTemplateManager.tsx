
import React, { useState, useEffect } from 'react';
import TemplateEditor from './TemplateEditor';
import TemplatesList from './TemplatesList';
import { EmailTemplate } from '@/types/emailTemplate';
import { getEmailTemplates } from '@/services/outreach/templates/emailTemplateService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const EmailTemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const templates = await getEmailTemplates();
      setTemplates(templates);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate(undefined);
    setActiveTab('editor');
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setActiveTab('editor');
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  const handleSaveTemplate = (id: string) => {
    loadTemplates();
    setActiveTab('list');
  };

  const handleCancel = () => {
    setActiveTab('list');
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="list">Templates</TabsTrigger>
        <TabsTrigger value="editor">
          {selectedTemplate ? 'Edit Template' : 'New Template'}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="list" className="mt-4">
        <TemplatesList
          templates={templates}
          isLoading={isLoading}
          onEdit={handleEditTemplate}
          onCreate={handleCreateTemplate}
          onDelete={handleDeleteTemplate}
        />
      </TabsContent>
      
      <TabsContent value="editor" className="mt-4">
        <TemplateEditor
          template={selectedTemplate}
          onSave={handleSaveTemplate}
          onCancel={handleCancel}
        />
      </TabsContent>
    </Tabs>
  );
};

export default EmailTemplateManager;
