import { supabase } from './supabase';

export async function deductButtons(
  userId: string,
  amount: number,
  transactionType: 'spent_bid' | 'purchase_user',
  relatedId: string | null,
  description: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('button_balance, total_buttons_spent')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;
    if (!profile) throw new Error('Profile not found');
    if (profile.button_balance < amount) {
      return { success: false, error: 'Insufficient button balance' };
    }

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        button_balance: profile.button_balance - amount,
        total_buttons_spent: profile.total_buttons_spent + amount,
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    const { error: transactionError } = await supabase
      .from('button_transactions')
      .insert({
        user_id: userId,
        amount: -amount,
        transaction_type: transactionType,
        related_id: relatedId,
        description,
      });

    if (transactionError) throw transactionError;

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function refundButtons(
  userId: string,
  amount: number,
  relatedId: string | null,
  description: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('button_balance')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;
    if (!profile) throw new Error('Profile not found');

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        button_balance: profile.button_balance + amount,
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    const { error: transactionError } = await supabase
      .from('button_transactions')
      .insert({
        user_id: userId,
        amount: amount,
        transaction_type: 'refund',
        related_id: relatedId,
        description,
      });

    if (transactionError) throw transactionError;

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function grantButtons(
  userId: string,
  amount: number,
  transactionType: 'purchase_platform' | 'earned_sale' | 'initial_grant',
  relatedId: string | null,
  description: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('button_balance, total_buttons_earned')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;
    if (!profile) throw new Error('Profile not found');

    const updateData: any = {
      button_balance: profile.button_balance + amount,
    };

    if (transactionType === 'earned_sale') {
      updateData.total_buttons_earned = profile.total_buttons_earned + amount;
    }

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', userId);

    if (updateError) throw updateError;

    const { error: transactionError } = await supabase
      .from('button_transactions')
      .insert({
        user_id: userId,
        amount: amount,
        transaction_type: transactionType,
        related_id: relatedId,
        description,
      });

    if (transactionError) throw transactionError;

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
