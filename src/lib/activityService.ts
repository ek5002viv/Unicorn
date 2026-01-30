import { supabase } from './supabase';

export type ActivityType = 'bid_placed' | 'bid_won' | 'bid_outbid' | 'item_listed' | 'item_sold' | 'buttons_purchased' | 'buttons_sold';

export interface Activity {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  related_id: string | null;
  metadata: any;
  created_at: string;
}

export async function logActivity(
  userId: string,
  activityType: ActivityType,
  relatedId: string | null,
  metadata: any
): Promise<void> {
  try {
    const { error } = await supabase
      .from('activities')
      .insert({
        user_id: userId,
        activity_type: activityType,
        related_id: relatedId,
        metadata: metadata,
      });

    if (error) {
      console.error('Failed to log activity:', error);
    }
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

export async function getRecentActivities(limit: number = 25): Promise<Activity[]> {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to fetch activities:', error);
    return [];
  }
}

export async function getUserActivities(userId: string, limit: number = 25): Promise<Activity[]> {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to fetch user activities:', error);
    return [];
  }
}
