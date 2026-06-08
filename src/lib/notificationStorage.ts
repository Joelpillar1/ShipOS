import { supabase } from './supabase';

export interface StoredNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'failure' | 'info';
  unread: boolean;
  createdAt: string;
  userId?: string;
}

const LOCAL_STORAGE_KEY = 'shipos_notifications';

// Helpers for localStorage fallback
function getLocalNotifications(): StoredNotification[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading localStorage notifications', e);
    return [];
  }
}

function saveLocalNotifications(notifications: StoredNotification[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notifications));
  } catch (e) {
    console.error('Error saving localStorage notifications', e);
  }
}

async function getAuthUser() {
  if (!supabase) return null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (e) {
    return null;
  }
}

// ----------------------------------------------------
// Notifications CRUD
// ----------------------------------------------------

export async function getNotifications(): Promise<StoredNotification[]> {
  const user = await getAuthUser();

  if (!user) {
    // localStorage mode
    return getLocalNotifications().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      title: item.title,
      message: item.message,
      type: item.type as StoredNotification['type'],
      unread: item.unread,
      createdAt: item.created_at,
      userId: item.user_id
    }));
  } catch (e) {
    console.error('Error loading notifications:', e);
    return [];
  }
}

export async function createNotification(
  notification: Omit<StoredNotification, 'id' | 'createdAt' | 'unread'>
): Promise<StoredNotification | null> {
  const user = await getAuthUser();

  if (!user) {
    // localStorage mode
    const newNotification: StoredNotification = {
      ...notification,
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      unread: true,
      createdAt: new Date().toISOString()
    };
    const current = getLocalNotifications();
    current.unshift(newNotification);
    saveLocalNotifications(current);
    return newNotification;
  }

  try {
    const insertData = {
      title: notification.title,
      message: notification.message,
      type: notification.type,
      user_id: user.id,
      unread: true
    };

    const { data, error } = await supabase
      .from('notifications')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      message: data.message,
      type: data.type as StoredNotification['type'],
      unread: data.unread,
      createdAt: data.created_at,
      userId: data.user_id
    };
  } catch (e) {
    console.error('Error creating notification:', e);
    return null;
  }
}

export async function markNotificationRead(id: string): Promise<boolean> {
  const user = await getAuthUser();

  if (!user) {
    // localStorage mode
    const current = getLocalNotifications();
    const index = current.findIndex(n => n.id === id);
    if (index !== -1) {
      current[index].unread = false;
      saveLocalNotifications(current);
      return true;
    }
    return false;
  }

  try {
    const { error } = await supabase
      .from('notifications')
      .update({ unread: false })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (e) {
    console.error('Error marking notification as read:', e);
    return false;
  }
}

export async function markAllNotificationsRead(): Promise<boolean> {
  const user = await getAuthUser();

  if (!user) {
    // localStorage mode
    const current = getLocalNotifications();
    const updated = current.map(n => ({ ...n, unread: false }));
    saveLocalNotifications(updated);
    return true;
  }

  try {
    const { error } = await supabase
      .from('notifications')
      .update({ unread: false })
      .eq('unread', true);

    if (error) throw error;
    return true;
  } catch (e) {
    console.error('Error marking all notifications as read:', e);
    return false;
  }
}

export async function deleteNotification(id: string): Promise<boolean> {
  const user = await getAuthUser();

  if (!user) {
    // localStorage mode
    const current = getLocalNotifications();
    const filtered = current.filter(n => n.id !== id);
    saveLocalNotifications(filtered);
    return true;
  }

  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (e) {
    console.error('Error deleting notification:', e);
    return false;
  }
}

export async function clearAllNotifications(): Promise<boolean> {
  const user = await getAuthUser();

  if (!user) {
    // localStorage mode
    saveLocalNotifications([]);
    return true;
  }

  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything

    if (error) throw error;
    return true;
  } catch (e) {
    console.error('Error clearing all notifications:', e);
    return false;
  }
}
