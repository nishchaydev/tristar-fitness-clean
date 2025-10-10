import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const BackendStatus: React.FC = () => {
  const { isBackendAvailable } = useAuth();

  if (isBackendAvailable) {
    return (
      <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        <Wifi className="h-3 w-3 mr-1" />
        Backend Connected
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
      <WifiOff className="h-3 w-3 mr-1" />
      Local Demo Mode
    </Badge>
  );
};

export default BackendStatus;

