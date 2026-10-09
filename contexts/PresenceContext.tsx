import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface PresenceContextType {
  onlineUserIds: Set<string>;
  isUserOnline: (userId: string | undefined | null) => boolean;
}

const PresenceContext = createContext<PresenceContextType>({
  onlineUserIds: new Set(),
  isUserOnline: () => false,
});

export const PresenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  const user = session?.user;
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      setOnlineUserIds(new Set());
      return;
    }

    const channel = supabase.channel('tg_online_presence', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const activeIds = new Set<string>();
        Object.keys(state).forEach((key) => {
          activeIds.add(key);
        });
        setOnlineUserIds(activeIds);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        setOnlineUserIds((prev) => {
          const next = new Set(prev);
          next.add(key);
          return next;
        });
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setOnlineUserIds((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && navigator.onLine) {
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    const handleOnline = async () => {
      try {
        await channel.track({
          user_id: user.id,
          online_at: new Date().toISOString(),
        });
      } catch {}
    };

    const handleOffline = async () => {
      try {
        await channel.untrack();
      } catch {}
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      try {
        channel.untrack();
        supabase.removeChannel(channel);
      } catch {}
    };
  }, [user?.id]);

  const isUserOnline = useMemo(() => {
    return (userId: string | undefined | null) => {
      if (!userId) return false;
      return onlineUserIds.has(userId);
    };
  }, [onlineUserIds]);

  return (
    <PresenceContext.Provider value={{ onlineUserIds, isUserOnline }}>
      {children}
    </PresenceContext.Provider>
  );
};

export const usePresence = () => useContext(PresenceContext);
