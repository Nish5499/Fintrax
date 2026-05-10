import { supabase } from '../supabase';
import { FinanceAPI, SplitAPI } from './api';

export const MigrationService = {
  async migrateLocalDataToSupabase() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // 1. Check if user has already onboarded/migrated
      const profile = await FinanceAPI.fetchProfile();
      if (profile?.onboarding_completed) {
        return true; // Already migrated
      }

      console.log('Starting migration from localStorage to Supabase...');

      // 2. Read local data
      const localTotalAdded = localStorage.getItem('fintrax-total-added');
      const localTransactions = localStorage.getItem('fintrax-wallet-txns');
      const localExpenses = localStorage.getItem('fintrax-expenses');
      const localSavingsGame = localStorage.getItem('fintrax-savings-game');
      const localGoals = localStorage.getItem('fintrax-goals');

      // 3. Migrate Profile
      const totalAdded = localTotalAdded ? parseFloat(localTotalAdded) : 0;
      await FinanceAPI.updateProfile({ 
        total_money_added: totalAdded,
        onboarding_completed: true 
      });

      // 4. Migrate Wallet Transactions
      if (localTransactions) {
        const txns = JSON.parse(localTransactions);
        for (const t of txns) {
          // ensure valid date
          const date = new Date(t.date).toISOString().split('T')[0];
          await supabase.from('transactions').insert({
            user_id: user.id,
            amount: t.amount,
            type: t.type,
            description: t.description,
            date: date
          });
        }
      }

      // 5. Migrate Expenses (also into transactions table)
      if (localExpenses) {
        const exps = JSON.parse(localExpenses);
        for (const e of exps) {
          const date = new Date(e.date).toISOString().split('T')[0];
          await supabase.from('transactions').insert({
            user_id: user.id,
            amount: e.amount,
            type: 'deduct',
            category: e.category,
            description: e.description,
            notes: e.notes,
            date: date
          });
        }
      }

      // 6. Migrate Savings Game
      if (localSavingsGame) {
        const game = JSON.parse(localSavingsGame);
        const cellsToInsert = game.map((g: any) => ({
          user_id: user.id,
          cell_id: g.id,
          value: g.value,
          completed: g.completed,
          completed_date: g.completedDate ? new Date(g.completedDate).toISOString() : null
        }));
        
        // chunk inserts if necessary, but 90 rows is small
        if (cellsToInsert.length > 0) {
          await supabase.from('savings_game').upsert(cellsToInsert, { onConflict: 'user_id, cell_id' });
        }
      }

      // 7. Migrate Goals
      if (localGoals) {
        const goals = JSON.parse(localGoals);
        for (const g of goals) {
          const deadline = g.deadline ? new Date(g.deadline).toISOString().split('T')[0] : null;
          await supabase.from('goals').insert({
            user_id: user.id,
            name: g.name,
            target_amount: g.targetAmount,
            current_amount: g.currentAmount,
            deadline: deadline,
            monthly_salary: g.monthlySalary,
            fixed_expenses: g.fixedExpenses,
            variable_expenses: g.variableExpenses,
            status: g.status
          });
        }
      }

      // Optionally clear local storage or leave as backup
      // localStorage.removeItem('fintrax-total-added');
      // localStorage.removeItem('fintrax-wallet-txns');
      // localStorage.removeItem('fintrax-expenses');
      // localStorage.removeItem('fintrax-savings-game');
      // localStorage.removeItem('fintrax-goals');

      console.log('Migration completed successfully.');
      return true;
    } catch (err) {
      console.error('Migration failed:', err);
      return false;
    }
  }
};
