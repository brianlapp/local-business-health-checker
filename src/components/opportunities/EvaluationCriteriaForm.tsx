
import React, { useState, useEffect } from 'react';
import { EvaluationCriteria } from '@/services/evaluation/opportunityEvaluationService';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface EvaluationCriteriaFormProps {
  criteria: EvaluationCriteria;
  onChange: (criteria: EvaluationCriteria) => void;
  onSave?: () => void;
}

const EvaluationCriteriaForm: React.FC<EvaluationCriteriaFormProps> = ({
  criteria,
  onChange,
  onSave
}) => {
  const [skillsText, setSkillsText] = useState<string>('');
  
  // When criteria changes externally, update the form
  useEffect(() => {
    if (criteria.userSkills) {
      setSkillsText(criteria.userSkills.join(', '));
    }
  }, [criteria]);
  
  const handleSkillsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSkillsText(e.target.value);
    
    // Convert comma-separated string to array
    const skillsArray = e.target.value
      .split(',')
      .map(skill => skill.trim())
      .filter(Boolean);
    
    onChange({
      ...criteria,
      userSkills: skillsArray
    });
  };
  
  const handleBudgetMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
    onChange({
      ...criteria,
      preferredBudgetMin: value
    });
  };
  
  const handleBudgetMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
    onChange({
      ...criteria,
      preferredBudgetMax: value
    });
  };
  
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...criteria,
      preferredLocation: e.target.value || undefined
    });
  };
  
  const handleRemoteChange = (checked: boolean) => {
    onChange({
      ...criteria,
      preferRemote: checked
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Evaluation Criteria</CardTitle>
        <CardDescription>
          Customize how opportunities are evaluated to match your preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Accordion type="single" collapsible defaultValue="skills">
          <AccordionItem value="skills">
            <AccordionTrigger>Skills & Expertise</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <Label htmlFor="skills">Your Skills</Label>
                <Textarea
                  id="skills"
                  placeholder="React, TypeScript, UI/UX, Node.js..."
                  value={skillsText}
                  onChange={handleSkillsChange}
                  className="min-h-[100px]"
                />
                <p className="text-sm text-muted-foreground">
                  Enter your skills as a comma-separated list. Opportunities that match these skills will receive higher scores.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="budget">
            <AccordionTrigger>Budget Preferences</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budgetMin">Minimum Budget</Label>
                    <Input
                      id="budgetMin"
                      type="number"
                      placeholder="Min budget"
                      value={criteria.preferredBudgetMin || ''}
                      onChange={handleBudgetMinChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budgetMax">Maximum Budget</Label>
                    <Input
                      id="budgetMax"
                      type="number"
                      placeholder="Max budget"
                      value={criteria.preferredBudgetMax || ''}
                      onChange={handleBudgetMaxChange}
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Set your preferred budget range. Opportunities that fall within this range will score higher.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="location">
            <AccordionTrigger>Location Preferences</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Preferred Location</Label>
                  <Input
                    id="location"
                    placeholder="City, Country"
                    value={criteria.preferredLocation || ''}
                    onChange={handleLocationChange}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="remote"
                    checked={criteria.preferRemote || false}
                    onCheckedChange={handleRemoteChange}
                  />
                  <Label htmlFor="remote">Prefer remote opportunities</Label>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Specify your location preferences. Remote opportunities will score higher if you prefer remote work.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      
      {onSave && (
        <CardFooter>
          <Button onClick={onSave}>Save Preferences</Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default EvaluationCriteriaForm;
