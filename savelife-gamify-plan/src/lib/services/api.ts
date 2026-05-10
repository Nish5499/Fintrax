import { supabase } from '../supabase';
import { Expense, FinancialGoal, SavingsGameCell, WalletTransaction } from '@/types/finance';
import { GroupExpense, GroupMember, Settlement, SplitGroup, ExpenseSplit } from '@/types/splitwise';

// --- Finance API ---

export const FinanceAPI = {
  async fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  },

  async updateProfile(updates: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    if (error) console.error('Error updating profile:', error);
  },

  async fetchTransactions() {
    const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async addTransaction(transaction: Omit<WalletTransaction | Expense, 'id'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase.from('transactions').insert([{
      user_id: user.id,
      ...transaction
    }]).select().single();
    if (error) throw error;
    return data;
  },

  async updateTransaction(id: string, updates: any) {
    const { data, error } = await supabase.from('transactions').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteTransaction(id: string) {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw error;
  },

  async fetchSavingsGame() {
    const { data, error } = await supabase.from('savings_game').select('*');
    if (error) throw error;
    return data;
  },

  async updateSavingsGameCell(cellId: number, updates: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    // Upsert the cell in case it wasn't saved yet
    const { data, error } = await supabase.from('savings_game').upsert({
      user_id: user.id,
      cell_id: cellId,
      ...updates
    }, { onConflict: 'user_id, cell_id' }).select().single();
    
    if (error) throw error;
    return data;
  },

  async fetchGoals() {
    const { data, error } = await supabase.from('goals').select('*').order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  async addGoal(goal: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase.from('goals').insert([{
      user_id: user.id,
      ...goal
    }]).select().single();
    if (error) throw error;
    return data;
  },

  async updateGoal(id: string, updates: any) {
    const { data, error } = await supabase.from('goals').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteGoal(id: string) {
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) throw error;
  }
};

// --- Splitwise API ---

export const SplitAPI = {
  async fetchGroups() {
    // Fetch groups created by user OR where user is a member (if app_user_id is set)
    // For simplicity with our RLS right now we fetch where user is created_by
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('groups')
      .select('*, members:group_members(*)');
    if (error) {
      console.error('Error fetching groups:', error);
      return [];
    }
    return data;
  },

  async createGroup(groupData: any, members: any[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: newGroup, error: groupError } = await supabase
      .from('groups')
      .insert([{
        name: groupData.name,
        type: groupData.type,
        created_by: user.id
      }])
      .select()
      .single();

    if (groupError) throw groupError;

    // Add members
    const membersToInsert = members.map(m => ({
      group_id: newGroup.id,
      name: m.name,
      email: m.email
    }));

    const { data: newMembers, error: membersError } = await supabase
      .from('group_members')
      .insert(membersToInsert)
      .select();

    if (membersError) throw membersError;

    return { ...newGroup, members: newMembers };
  },

  async updateGroup(id: string, updates: any) {
    const { data, error } = await supabase.from('groups').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteGroup(id: string) {
    const { error } = await supabase.from('groups').delete().eq('id', id);
    if (error) throw error;
  },

  async addMember(groupId: string, member: any) {
    const { data, error } = await supabase.from('group_members').insert([{
      group_id: groupId,
      name: member.name,
      email: member.email
    }]).select().single();
    if (error) throw error;
    return data;
  },

  async removeMember(groupId: string, memberId: string) {
    const { error } = await supabase.from('group_members').delete().eq('id', memberId).eq('group_id', groupId);
    if (error) throw error;
  },

  async fetchGroupExpenses() {
    // Fetch all expenses across all groups the user has access to
    const { data, error } = await supabase
      .from('group_expenses')
      .select('*, splits:expense_splits(*)');
    if (error) throw error;
    return data;
  },

  async addGroupExpense(expense: any, splits: any[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: newExpense, error: expenseError } = await supabase
      .from('group_expenses')
      .insert([{
        group_id: expense.groupId,
        added_by: user.id,
        amount: expense.amount,
        description: expense.description,
        category: expense.category,
        split_type: expense.splitType,
        date: expense.date
      }])
      .select()
      .single();

    if (expenseError) throw expenseError;

    const splitsToInsert = splits.map(s => ({
      expense_id: newExpense.id,
      member_id: s.memberId,
      paid_amount: s.paidAmount || 0,
      owed_amount: s.owedAmount || 0
    }));

    const { data: newSplits, error: splitsError } = await supabase
      .from('expense_splits')
      .insert(splitsToInsert)
      .select();

    if (splitsError) throw splitsError;

    return { ...newExpense, splits: newSplits };
  },

  async deleteGroupExpense(id: string) {
    const { error } = await supabase.from('group_expenses').delete().eq('id', id);
    if (error) throw error;
  },

  async fetchSettlements() {
    const { data, error } = await supabase.from('settlements').select('*');
    if (error) throw error;
    return data;
  },

  async settleUp(settlement: any) {
    const { data, error } = await supabase.from('settlements').insert([{
      group_id: settlement.groupId,
      from_member_id: settlement.from,
      to_member_id: settlement.to,
      amount: settlement.amount,
      payment_mode: settlement.paymentMode,
      date: settlement.date
    }]).select().single();
    if (error) throw error;
    return data;
  }
};
