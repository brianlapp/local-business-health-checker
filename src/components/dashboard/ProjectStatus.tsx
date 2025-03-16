
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RefreshCw, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import implementationSpec from '@/docs/implementation-spec.md?raw';

// Define status types for project phases
type PhaseStatus = 'completed' | 'in-progress' | 'planned';

// Project phase structure
interface ProjectPhase {
  id: string;
  name: string;
  status: PhaseStatus;
  progress: number;
  items: {
    id: string;
    name: string;
    status: PhaseStatus | 'blocked';
  }[];
}

const ProjectStatus: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Extract phases from the implementation spec md file
  const phases: ProjectPhase[] = [
    {
      id: 'core-infrastructure',
      name: 'Core Platform Infrastructure',
      status: 'completed',
      progress: 100,
      items: [
        { id: 'auth', name: 'Authentication System', status: 'completed' },
        { id: 'navigation', name: 'Navigation & UI Framework', status: 'completed' },
        { id: 'profile', name: 'Professional Profile System', status: 'completed' },
      ]
    },
    {
      id: 'opportunity-management',
      name: 'Opportunity Management System',
      status: 'completed',
      progress: 100,
      items: [
        { id: 'opportunity-interface', name: 'Opportunity Interface', status: 'completed' },
        { id: 'opportunity-evaluation', name: 'Opportunity Evaluation', status: 'completed' },
      ]
    },
    {
      id: 'discovery-systems',
      name: 'Discovery Systems',
      status: 'in-progress',
      progress: 75,
      items: [
        { id: 'job-board', name: 'Job Board Integration', status: 'completed' },
        { id: 'website-analysis', name: 'Business Website Analysis', status: 'completed' },
        { id: 'map-discovery', name: 'Map-Based Business Discovery', status: 'in-progress' },
        { id: 'agency-analysis', name: 'Agency Analysis', status: 'in-progress' },
      ]
    },
    {
      id: 'scanning-system',
      name: 'Automated Scanning System',
      status: 'in-progress',
      progress: 40,
      items: [
        { id: 'scan-automation', name: 'Scan Automation', status: 'in-progress' },
        { id: 'scanning-analytics', name: 'Scanning Analytics', status: 'in-progress' },
      ]
    },
    {
      id: 'outreach-management',
      name: 'Outreach Management',
      status: 'planned',
      progress: 0,
      items: [
        { id: 'proposal-generation', name: 'Proposal Generation', status: 'planned' },
        { id: 'outreach-automation', name: 'Outreach Automation', status: 'planned' },
      ]
    },
    {
      id: 'analytics-dashboard',
      name: 'Analytics Dashboard',
      status: 'planned',
      progress: 0,
      items: [
        { id: 'performance-metrics', name: 'Performance Metrics', status: 'planned' },
        { id: 'visualization-tools', name: 'Visualization Tools', status: 'planned' },
      ]
    },
  ];

  // Calculate overall project progress
  const overallProgress = Math.round(
    phases.reduce((sum, phase) => sum + phase.progress, 0) / phases.length
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Simulate fetching updated implementation spec
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated(new Date());
    }, 1000);
  };

  // Status badge renderers
  const renderStatusBadge = (status: PhaseStatus | 'blocked') => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600"><CheckCircle className="mr-1 h-3 w-3" /> Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-600"><Clock className="mr-1 h-3 w-3" /> In Progress</Badge>;
      case 'planned':
        return <Badge className="bg-amber-600"><AlertCircle className="mr-1 h-3 w-3" /> Planned</Badge>;
      case 'blocked':
        return <Badge className="bg-red-600"><XCircle className="mr-1 h-3 w-3" /> Blocked</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Project Status</CardTitle>
            <CardDescription>Implementation progress tracker</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Updating...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <h3 className="text-sm font-medium mb-1">Overall Progress: {overallProgress}%</h3>
            <Progress 
              value={overallProgress} 
              indicatorClassName={overallProgress < 30 
                ? "bg-amber-500" 
                : overallProgress < 70 
                  ? "bg-blue-500" 
                  : "bg-green-500"
              }
            />
          </div>
          <div className="text-xs text-muted-foreground">
            Last updated: {lastUpdated.toLocaleString()}
          </div>
        </div>

        <Accordion type="single" collapsible className="border rounded-md">
          {phases.map((phase) => (
            <AccordionItem key={phase.id} value={phase.id}>
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <span>{phase.name}</span>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={phase.progress} 
                      className="w-24 h-2"
                      indicatorClassName={phase.progress === 0
                        ? "bg-slate-300"
                        : phase.progress < 100 
                          ? "bg-blue-500" 
                          : "bg-green-500"
                      }
                    />
                    {renderStatusBadge(phase.status)}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-2 pb-3">
                <ul className="space-y-2">
                  {phase.items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between">
                      <span className="text-sm">{item.name}</span>
                      {renderStatusBadge(item.status)}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <Collapsible
          open={isExpanded}
          onOpenChange={setIsExpanded}
          className="border rounded-md"
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
              <h3 className="text-sm font-medium">Implementation Specification</h3>
              <Button variant="ghost" size="sm">
                {isExpanded ? 'Hide Details' : 'Show Details'}
              </Button>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4 pt-0 max-h-96 overflow-auto">
              <pre className="whitespace-pre-wrap text-xs">{implementationSpec}</pre>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default ProjectStatus;
