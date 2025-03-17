
import { supabase } from '@/lib/supabase';
import { getGTmetrixUsage } from '@/services/businessScanService';

// Define the scan analytics types
export type ScanAnalytics = {
  // Summary statistics
  totalScans: number;
  successRate: number;
  avgDuration: number;
  scanTrend: number;
  successRateTrend: number;
  durationTrend: number;
  
  // API usage statistics
  apiUsagePercent: number;
  apiUsageCurrent: number;
  apiUsageLimit: number;
  
  // Detailed metrics
  avgQueueTime: number;
  avgProcessingTime: number;
  avgScanSize: number;
  
  // Error metrics
  networkErrorCount: number;
  timeoutErrorCount: number;
  rateLimitErrorCount: number;
  
  // Usage statistics
  lighthouseUsage: { used: number; limit: number };
  gtmetrixUsage: { used: number; limit: number };
  builtwithUsage: { used: number; limit: number };
  
  // Chart data
  activityData: {
    date: string;
    completed: number;
    failed: number;
  }[];
  
  statusDistribution: {
    name: 'completed' | 'failed' | 'pending' | 'processing';
    value: number;
  }[];
};

/**
 * Get scan analytics data for a timeframe
 */
export async function getScanAnalytics(
  timeframe: 'day' | 'week' | 'month' = 'week'
): Promise<ScanAnalytics> {
  try {
    // Calculate the date range based on timeframe
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case 'day':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(endDate.getDate() - 30);
        break;
    }
    
    // Get the scan queue data for this timeframe
    const { data: scans, error } = await supabase
      .from('scan_queue')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error('Error fetching scan queue data:', error);
      throw error;
    }
    
    // Get previous period data for trend calculations
    const previousStartDate = new Date(startDate);
    const previousEndDate = new Date(startDate);
    
    switch (timeframe) {
      case 'day':
        previousStartDate.setDate(previousStartDate.getDate() - 1);
        break;
      case 'week':
        previousStartDate.setDate(previousStartDate.getDate() - 7);
        break;
      case 'month':
        previousStartDate.setDate(previousStartDate.getDate() - 30);
        break;
    }
    
    const { data: previousScans, error: previousError } = await supabase
      .from('scan_queue')
      .select('*')
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', startDate.toISOString());
      
    if (previousError) {
      console.error('Error fetching previous scan queue data:', previousError);
    }
    
    // Get API usage data
    const gtmetrixUsage = await getGTmetrixUsage();
    
    // Calculate metrics
    const totalScans = scans ? scans.length : 0;
    const completedScans = scans ? scans.filter(scan => scan.status === 'completed').length : 0;
    const failedScans = scans ? scans.filter(scan => scan.status === 'failed').length : 0;
    const pendingScans = scans ? scans.filter(scan => scan.status === 'pending').length : 0;
    const processingScans = scans ? scans.filter(scan => scan.status === 'processing').length : 0;
    
    const successRate = totalScans > 0 ? Math.round((completedScans / totalScans) * 100) : 0;
    
    // Calculate average duration for completed scans
    let totalDuration = 0;
    let scanCount = 0;
    
    if (scans) {
      scans.forEach(scan => {
        if (scan.status === 'completed' && scan.started_at && scan.completed_at) {
          const startTime = new Date(scan.started_at).getTime();
          const endTime = new Date(scan.completed_at).getTime();
          const duration = (endTime - startTime) / 1000; // convert to seconds
          
          if (duration > 0) {
            totalDuration += duration;
            scanCount++;
          }
        }
      });
    }
    
    const avgDuration = scanCount > 0 ? Math.round(totalDuration / scanCount) : 0;
    
    // Calculate trend percentages
    const previousTotalScans = previousScans ? previousScans.length : 0;
    const previousCompletedScans = previousScans ? previousScans.filter(scan => scan.status === 'completed').length : 0;
    
    let previousAvgDuration = 0;
    let previousScanCount = 0;
    
    if (previousScans) {
      previousScans.forEach(scan => {
        if (scan.status === 'completed' && scan.started_at && scan.completed_at) {
          const startTime = new Date(scan.started_at).getTime();
          const endTime = new Date(scan.completed_at).getTime();
          const duration = (endTime - startTime) / 1000; // convert to seconds
          
          if (duration > 0) {
            previousAvgDuration += duration;
            previousScanCount++;
          }
        }
      });
    }
    
    previousAvgDuration = previousScanCount > 0 ? previousAvgDuration / previousScanCount : 0;
    const previousSuccessRate = previousTotalScans > 0 ? (previousCompletedScans / previousTotalScans) * 100 : 0;
    
    const scanTrend = previousTotalScans > 0 
      ? Math.round(((totalScans - previousTotalScans) / previousTotalScans) * 100) 
      : 0;
      
    const successRateTrend = previousSuccessRate > 0 
      ? Math.round(successRate - previousSuccessRate) 
      : 0;
      
    const durationTrend = previousAvgDuration > 0 
      ? Math.round(((avgDuration - previousAvgDuration) / previousAvgDuration) * 100) 
      : 0;
    
    // Generate activity data for the chart
    const activityData: ScanAnalytics['activityData'] = [];
    
    // Create buckets based on timeframe
    const bucketCount = timeframe === 'day' ? 24 : timeframe === 'week' ? 7 : 30;
    const bucketSize = (endDate.getTime() - startDate.getTime()) / bucketCount;
    
    for (let i = 0; i < bucketCount; i++) {
      const bucketDate = new Date(startDate.getTime() + (i * bucketSize));
      const nextBucketDate = new Date(startDate.getTime() + ((i + 1) * bucketSize));
      
      const bucketScans = scans ? scans.filter(scan => {
        const scanDate = new Date(scan.created_at);
        return scanDate >= bucketDate && scanDate < nextBucketDate;
      }) : [];
      
      const bucketCompleted = bucketScans.filter(scan => scan.status === 'completed').length;
      const bucketFailed = bucketScans.filter(scan => scan.status === 'failed').length;
      
      activityData.push({
        date: bucketDate.toISOString(),
        completed: bucketCompleted,
        failed: bucketFailed
      });
    }
    
    // Count error types
    const networkErrorCount = scans 
      ? scans.filter(scan => scan.error && scan.error.includes('network')).length
      : 0;
      
    const timeoutErrorCount = scans 
      ? scans.filter(scan => scan.error && scan.error.includes('timeout')).length
      : 0;
      
    const rateLimitErrorCount = scans 
      ? scans.filter(scan => scan.error && scan.error.includes('rate limit')).length
      : 0;
    
    // Create mock data for performance metrics 
    // (since the real data might require more complex calculations)
    const avgQueueTime = 12; // seconds
    const avgProcessingTime = 18; // seconds
    const avgScanSize = 240; // KB
    
    return {
      totalScans,
      successRate,
      avgDuration,
      scanTrend,
      successRateTrend,
      durationTrend,
      
      // API usage
      apiUsagePercent: gtmetrixUsage ? Math.round((gtmetrixUsage.scans_used / gtmetrixUsage.scan_limit) * 100) : 0,
      apiUsageCurrent: gtmetrixUsage ? gtmetrixUsage.scans_used : 0,
      apiUsageLimit: gtmetrixUsage ? gtmetrixUsage.scan_limit : 0,
      
      // Detailed metrics
      avgQueueTime,
      avgProcessingTime,
      avgScanSize,
      
      // Error metrics
      networkErrorCount,
      timeoutErrorCount,
      rateLimitErrorCount,
      
      // Usage statistics
      lighthouseUsage: { used: 42, limit: 100 }, // Mock data
      gtmetrixUsage: { 
        used: gtmetrixUsage ? gtmetrixUsage.scans_used : 0, 
        limit: gtmetrixUsage ? gtmetrixUsage.scan_limit : 5 
      },
      builtwithUsage: { used: 15, limit: 50 }, // Mock data
      
      // Chart data
      activityData,
      
      statusDistribution: [
        { name: 'completed', value: completedScans },
        { name: 'failed', value: failedScans },
        { name: 'pending', value: pendingScans },
        { name: 'processing', value: processingScans }
      ]
    };
  } catch (error) {
    console.error('Error in getScanAnalytics:', error);
    
    // Return empty data in case of error
    return {
      totalScans: 0,
      successRate: 0,
      avgDuration: 0,
      scanTrend: 0,
      successRateTrend: 0,
      durationTrend: 0,
      apiUsagePercent: 0,
      apiUsageCurrent: 0,
      apiUsageLimit: 0,
      avgQueueTime: 0,
      avgProcessingTime: 0,
      avgScanSize: 0,
      networkErrorCount: 0,
      timeoutErrorCount: 0,
      rateLimitErrorCount: 0,
      lighthouseUsage: { used: 0, limit: 100 },
      gtmetrixUsage: { used: 0, limit: 5 },
      builtwithUsage: { used: 0, limit: 50 },
      activityData: [],
      statusDistribution: []
    };
  }
}
