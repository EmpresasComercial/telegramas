import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Check } from 'lucide-react';

export const ConnectivityOverlay: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showSyncSuccess, setShowSyncSuccess] = useState<boolean>(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOnline(false);
      setShowSyncSuccess(false);
    };

    const handleOnline = () => {
      setIsOnline(true);
      setShowSyncSuccess(true);
      // Dispara evento global de sincronização para todos os ouvintes do app
      window.dispatchEvent(new CustomEvent('app:sync-data'));
      const timer = setTimeout(() => {
        setShowSyncSuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return (
    <AnimatePresence>
      {(!isOnline || showSyncSuccess) && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed top-0 left-0 right-0 z-[10000] flex justify-center pointer-events-none"
        >
          <div
            className={`w-full max-w-[650px] py-1 px-3 text-center text-[12px] font-medium flex items-center justify-center gap-2 shadow-md transition-colors ${
              !isOnline
                ? 'bg-[#e67e22] text-white'
                : 'bg-[#27ae60] text-white'
            }`}
          >
            {!isOnline ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Aguardando rede... Conectando</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Conectado • Sincronizando dados reais</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

