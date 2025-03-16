
import React from 'react';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  RefreshCw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const Icons = {
  spinner: Loader2,
  check: CheckCircle,
  checkCircle: CheckCircle2,
  error: XCircle,
  errorCircle: XCircle, // Changed from XCircle2 to XCircle
  alert: AlertCircle,
  warning: AlertTriangle,
  clock: Clock,
  refresh: RefreshCw,
  // Add any other icons used in the app as needed
};
