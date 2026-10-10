import { useState, useEffect } from 'react';

export type NetworkStatus = 'online' | 'waiting' | 'connecting';

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>(() => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return 'waiting';
    }
    return 'online';
  });

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    const handleOffline = () => {
      if (timer) clearTimeout(timer);
      setStatus('waiting');
    };

    const handleOnline = () => {
      setStatus('connecting');
      window.dispatchEvent(new CustomEvent('app:sync-data'));
      
      timer = setTimeout(() => {
        setStatus('online');
      }, 1800);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const isOfflineOrConnecting = status !== 'online';
  const statusText = status === 'waiting' 
    ? 'Aguardando rede...' 
    : status === 'connecting' 
    ? 'Conectando...' 
    : null;

  return {
    status,
    isOfflineOrConnecting,
    statusText,
    isWaiting: status === 'waiting',
    isConnecting: status === 'connecting',
    isOnline: status === 'online',
  };
}
