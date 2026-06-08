import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import {
  StoredNotification,
  getNotifications,
  createNotification,
  markAllNotificationsRead,
  deleteNotification as apiDeleteNotification,
  clearAllNotifications as apiClearAllNotifications,
  markNotificationRead as apiMarkNotificationRead
} from '@/lib/notificationStorage';

interface NotificationContextType {
  notifications: StoredNotification[];
  unreadCount: number;
  loading: boolean;
  addNotification: (title: string, message: string, type: StoredNotification['type']) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  refetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Robust helper to play a clean chime sound on notifications
const playNotificationSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime); // Slightly boosted volume for clarity
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.15);
  } catch (err) {
    console.warn('Audio playback not allowed or failed:', err);
  }
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotifications = useCallback(async () => {
    try {
      const list = await getNotifications();
      setNotifications(list);
    } catch (e) {
      console.error('Error fetching notifications:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Set up realtime subscriptions for Supabase database changes
  useEffect(() => {
    fetchNotifications();

    if (!supabase) return;

    const channel = supabase
      .channel('notifications_realtime_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          // Whenever something changes in notifications table, refresh state
          fetchNotifications();

          // If a new notification is inserted, trigger a browser-level notification audio or toast
          if (payload.eventType === 'INSERT') {
            const newNotif = payload.new as any;
            // Display toast for new notification
            toast({
              title: newNotif.title,
              description: newNotif.message,
              variant: newNotif.type === 'failure' ? 'destructive' : 'default',
            });
            // Try to play audio beep if supported
            playNotificationSound();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications, toast]);

  const addNotification = async (title: string, message: string, type: StoredNotification['type']) => {
    try {
      const created = await createNotification({ title, message, type });
      if (created) {
        // In local/mock mode, createNotification won't trigger the realtime Postgres channel event,
        // so we manually append to state here to ensure the UI updates instantly.
        if (!supabase) {
          setNotifications(prev => [created, ...prev]);
          toast({
            title,
            description: message,
            variant: type === 'failure' ? 'destructive' : 'default',
          });
          playNotificationSound();
        } else {
          // If we are in Supabase mode, the database realtime listener will pick up the INSERT event
          // and trigger playNotificationSound() automatically.
          // However, we also trigger playNotificationSound() synchronously here to bypass browser
          // async audio context block constraints for direct user simulation actions.
          playNotificationSound();
        }
      }
    } catch (e) {
      console.error('Error adding notification:', e);
    }
  };

  const markAllAsRead = async () => {
    try {
      const success = await markAllNotificationsRead();
      if (success) {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
        toast({
          title: "Alerts Cleared",
          description: "All notifications have been marked as read."
        });
      }
    } catch (e) {
      console.error('Error marking all as read:', e);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const success = await apiMarkNotificationRead(id);
      if (success) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
      }
    } catch (e) {
      console.error('Error marking notification read:', e);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const success = await apiDeleteNotification(id);
      if (success) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (e) {
      console.error('Error deleting notification:', e);
    }
  };

  const clearAll = async () => {
    try {
      const success = await apiClearAllNotifications();
      if (success) {
        setNotifications([]);
        toast({
          title: "Inbox Cleared",
          description: "All notifications were successfully cleared."
        });
      }
    } catch (e) {
      console.error('Error clearing notifications:', e);
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        addNotification,
        markAllAsRead,
        markAsRead,
        deleteNotification,
        clearAll,
        refetchNotifications: fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
