
// This file is now a facade that re-exports functions from more specialized services
// This maintains backward compatibility while allowing for better code organization

import { 
  toggleAutomatedScanning, 
  getAutomationStatus,
  type AutomationStatus
} from './automationService';

import { 
  triggerManualScan, 
  manuallyRescanBusiness 
} from './scanTriggerService';

import { 
  getScanQueueStatus,
  type ScanQueueStatus
} from './scanStatisticsService';

import { 
  getScheduleSettings, 
  updateScheduleSettings,
  type ScheduleSettings
} from './scheduleSettingsService';

// Re-export all types and functions to maintain backward compatibility
export type { 
  AutomationStatus,
  ScanQueueStatus,
  ScheduleSettings
};

export {
  // Automation control
  toggleAutomatedScanning,
  getAutomationStatus,
  
  // Manual scan triggers
  triggerManualScan,
  manuallyRescanBusiness,
  
  // Queue statistics
  getScanQueueStatus,
  
  // Schedule settings
  getScheduleSettings,
  updateScheduleSettings
};
