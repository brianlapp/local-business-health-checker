
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Building, Globe, Upload } from 'lucide-react';
import { addBusiness } from '@/services/apiService';
import { Business } from '@/types/business';
import { toast } from 'sonner';

const AddBusiness = () => {
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isBatchUploading, setIsBatchUploading] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !website) {
      toast.error('Please fill out all fields');
      return;
    }
    
    // Basic URL validation
    let websiteUrl = website;
    if (!website.startsWith('http://') && !website.startsWith('https://')) {
      websiteUrl = 'https://' + website;
    }
    
    setIsSubmitting(true);
    
    try {
      await addBusiness({
        name,
        website: websiteUrl.replace(/^https?:\/\//, ''),
      });
      
      toast.success('Business added successfully');
      setName('');
      setWebsite('');
      navigate('/');
    } catch (error) {
      toast.error('Failed to add business');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
    }
  };
  
  const handleBatchUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!csvFile) {
      toast.error('Please select a CSV file');
      return;
    }
    
    setIsBatchUploading(true);
    
    try {
      // In a real implementation, we would parse the CSV and add each business
      // For now, we'll just simulate this with a timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Batch upload completed');
      setCsvFile(null);
      navigate('/');
    } catch (error) {
      toast.error('Failed to upload businesses');
      console.error(error);
    } finally {
      setIsBatchUploading(false);
    }
  };
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold">Add Business</h2>
          <p className="text-muted-foreground">Manually add businesses to scan</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/')}>
          Back to Dashboard
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Add Single Business</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="name">
                  Business Name
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Enter business name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="website">
                  Website URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="website"
                    placeholder="example.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || !name || !website}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Business
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Batch Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBatchUpload} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="csv">
                  CSV File
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm mb-2">
                    Drop your CSV file here or <span className="text-primary">browse</span>
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    CSV should have columns: name, website
                  </p>
                  <Input
                    id="csv"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('csv')?.click()}
                    disabled={isBatchUploading}
                  >
                    Select File
                  </Button>
                  {csvFile && (
                    <p className="text-xs mt-2 text-muted-foreground">
                      Selected: {csvFile.name}
                    </p>
                  )}
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isBatchUploading || !csvFile}
              >
                {isBatchUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload CSV
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddBusiness;
