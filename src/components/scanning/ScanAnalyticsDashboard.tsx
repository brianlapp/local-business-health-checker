
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ScanAnalytics, 
  getScanAnalytics 
} from '@/services/scheduling/scanAnalyticsService';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Activity as ActivityIcon, 
  BarChart2 as ChartIcon,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format, subDays } from 'date-fns';

const ScanAnalyticsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<ScanAnalytics | null>(null);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await getScanAnalytics(timeframe);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading scan analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    if (timeframe === 'day') {
      return format(new Date(timestamp), 'HH:mm');
    } else if (timeframe === 'week') {
      return format(new Date(timestamp), 'EEE');
    } else {
      return format(new Date(timestamp), 'MMM dd');
    }
  };

  // Generate labels for the x-axis based on timeframe
  const generateTimeLabels = () => {
    const labels = [];
    const today = new Date();
    let days = 0;
    
    switch (timeframe) {
      case 'day':
        days = 1;
        break;
      case 'week':
        days = 7;
        break;
      case 'month':
        days = 30;
        break;
    }
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      labels.push({
        date: date,
        label: timeframe === 'day' 
          ? format(date, 'HH:mm') 
          : timeframe === 'week' 
            ? format(date, 'EEE') 
            : format(date, 'MMM dd')
      });
    }
    
    return labels;
  };

  const statusColors = {
    completed: "#4ade80",
    failed: "#f87171",
    pending: "#60a5fa",
    processing: "#fbbf24"
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <ChartIcon className="mr-2 h-5 w-5" />
              Scan Analytics
            </CardTitle>
            <CardDescription>
              Metrics and performance of your automatic scans
            </CardDescription>
          </div>
          <Tabs 
            value={timeframe} 
            onValueChange={(value) => setTimeframe(value as 'day' | 'week' | 'month')}
            className="w-auto"
          >
            <TabsList className="grid w-[200px] grid-cols-3">
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-[250px] w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-[100px]" />
              <Skeleton className="h-[100px]" />
            </div>
          </div>
        ) : !analytics ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading data</AlertTitle>
            <AlertDescription>
              Failed to load scan analytics. Please try again later.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-3">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Scans</p>
                  <p className="text-2xl font-bold">{analytics.totalScans}</p>
                  <div className="flex items-center text-xs">
                    <Badge variant={analytics.scanTrend > 0 ? "success" : "destructive"}>
                      {analytics.scanTrend > 0 ? '+' : ''}{analytics.scanTrend}%
                    </Badge>
                    <span className="ml-2 text-muted-foreground">vs. previous {timeframe}</span>
                  </div>
                </div>
              </Card>
              <Card className="p-3">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{analytics.successRate}%</p>
                  <div className="flex items-center text-xs">
                    <Badge variant={analytics.successRateTrend > 0 ? "success" : "destructive"}>
                      {analytics.successRateTrend > 0 ? '+' : ''}{analytics.successRateTrend}%
                    </Badge>
                    <span className="ml-2 text-muted-foreground">vs. previous {timeframe}</span>
                  </div>
                </div>
              </Card>
              <Card className="p-3">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Avg Duration</p>
                  <p className="text-2xl font-bold">{analytics.avgDuration}s</p>
                  <div className="flex items-center text-xs">
                    <Badge variant={analytics.durationTrend < 0 ? "success" : "destructive"}>
                      {analytics.durationTrend > 0 ? '+' : ''}{analytics.durationTrend}%
                    </Badge>
                    <span className="ml-2 text-muted-foreground">vs. previous {timeframe}</span>
                  </div>
                </div>
              </Card>
              <Card className="p-3">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">API Usage</p>
                  <p className="text-2xl font-bold">{analytics.apiUsagePercent}%</p>
                  <div className="flex items-center text-xs">
                    <span className="text-muted-foreground">{analytics.apiUsageCurrent} of {analytics.apiUsageLimit}</span>
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-[300px]">
                <h3 className="text-sm font-medium mb-2">Scan Activity</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics.activityData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date"
                      tickFormatter={formatDate}
                      tickMargin={10}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [`${value} scans`, name]}
                      labelFormatter={(label) => format(new Date(label), 'PPP')}
                    />
                    <Bar dataKey="completed" name="Completed" fill={statusColors.completed} />
                    <Bar dataKey="failed" name="Failed" fill={statusColors.failed} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="h-[300px]">
                <h3 className="text-sm font-medium mb-2">Scan Status Distribution</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={statusColors[entry.name as keyof typeof statusColors]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} scans`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <Tabs defaultValue="performance">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="errors">Errors</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>
              
              <TabsContent value="performance" className="mt-4">
                <div className="rounded-md border p-4">
                  <h3 className="text-sm font-medium mb-2">Performance Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Queue Time</p>
                      <p className="text-lg font-medium">{analytics.avgQueueTime} sec</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Processing Time</p>
                      <p className="text-lg font-medium">{analytics.avgProcessingTime} sec</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Scan Size</p>
                      <p className="text-lg font-medium">{analytics.avgScanSize} KB</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="errors" className="mt-4">
                <div className="rounded-md border p-4">
                  <h3 className="text-sm font-medium mb-2">Error Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Network Errors</p>
                      <p className="text-lg font-medium">{analytics.networkErrorCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Timeout Errors</p>
                      <p className="text-lg font-medium">{analytics.timeoutErrorCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rate Limit Errors</p>
                      <p className="text-lg font-medium">{analytics.rateLimitErrorCount}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="resources" className="mt-4">
                <div className="rounded-md border p-4">
                  <h3 className="text-sm font-medium mb-2">Resource Usage</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Lighthouse Credits</p>
                      <p className="text-lg font-medium">{analytics.lighthouseUsage.used}/{analytics.lighthouseUsage.limit}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">GTmetrix Credits</p>
                      <p className="text-lg font-medium">{analytics.gtmetrixUsage.used}/{analytics.gtmetrixUsage.limit}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">BuiltWith Credits</p>
                      <p className="text-lg font-medium">{analytics.builtwithUsage.used}/{analytics.builtwithUsage.limit}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScanAnalyticsDashboard;
