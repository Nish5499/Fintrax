import { supabase } from '../supabase';
import { FinanceAPI } from './api';

const safeDate = (dateStr: any): string => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
    return d.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
};

export const MigrationService = {
  async migrateLocalDataToSupabase() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // 1. Ensure profile exists (critical — all other tables have FK to profiles)
      const profile = await FinanceAPI.ensureProfile();
      if (!profile) {
        console.error('Migration aborted: could not ensure profile exists.');
        return false;
      }

      // 2. Skip if already migrated
      if (profile.onboarding_completed === true) {
        return true;
      }

      console.log('Starting migration from localStorage to Supabase...');

      // 3. Read local data
      const localTotalAdded = localStorage.getItem('fintrax-total-added');
      const localTransactions = localStorage.getItem('fintrax-wallet-txns');
      const localExpenses = localStorage.getItem('fintrax-expenses');
      const localSavingsGame = localStorage.getItem('fintrax-savings-game');
      const localGoals = localStorage.getItem('fintrax-goals');

      // 4. Check if there's anything to migrate
      const hasData = localTotalAdded || localTransactions || localExpenses || localSavingsGame || localGoals;
      if (!hasData) {
        // No local data — just mark as onboarded
        await FinanceAPI.updateProfile({ onboarding_completed: true });
        console.log('No local data to migrate. Marked as onboarded.');
        return true;
      }

      // 5. Migrate wallet transactions (batch upsert)
      if (localTransactions) {
        try {
          const txns = JSON.parse(localTransactions);
          if (Array.isArray(txns) && txns.length > 0) {
            const rows = txns
              .filter(t => t && t.amount != null)
              .map(t => ({
                user_id: user.id,
                amount: t.amount,
                type: t.type || 'add',
                description: t.description || '',
                date: safeDate(t.date)
              }));
            if (rows.length > 0) {
              const { error } = await supabase.from('transactions').insert(rows);
              if (error && error.code !== '23505') {
                console.error('Error migrating wallet transactions:', error);
              }
            }
          }
        } catch (e) {
          console.error('Error parsing wallet transactions:', e);
        }
      }

      // 6. Migrate expenses (batch insert)
      if (localExpenses) {
        try {
          const exps = JSON.parse(localExpenses);
          if (Array.isArray(exps) && exps.length > 0) {
            const rows = exps
              .filter(e => e && e.amount != null)
              .map(e => ({
                user_id: user.id,
                amount: e.amount,
                type: 'deduct',
                category: e.category || null,
                description: e.description || '',
                notes: e.notes || null,
                date: safeDate(e.date)
              }));
            if (rows.length > 0) {
              const { error } = await supabase.from('transactions').insert(rows);
              if (error && error.code !== '23505') {
                console.error('Error migrating expenses:', error);
              }
            }
          }
        } catch (e) {
          console.error('Error parsing expenses:', e);
        }
      }

      // 7. Migrate savings game (upsert — already idempotent)
      if (localSavingsGame) {
        try {
          const game = JSON.parse(localSavingsGame);
          if (Array.isArray(game) && game.length > 0) {
            const cellsToInsert = game
              .filter(g => g && g.id != null && g.value != null)
              .map(g => ({
                user_id: user.id,
                cell_id: g.id,
                value: g.value,
                completed: g.completed || false,
                completed_date: g.completedDate ? new Date(g.completedDate).toISOString() : null
              }));
            if (cellsToInsert.length > 0) {
              const { error } = await supabase
                .from('savings_game')
                .upsert(cellsToInsert, { onConflict: 'user_id, cell_id' });
              if (error) console.error('Error migrating savings game:', error);
            }
          }
        } catch (e) {
          console.error('Error parsing savings game:', e);
        }
      }

      // 8. Migrate goals (batch insert)
      if (localGoals) {
        try {
          const goals = JSON.parse(localGoals);
          if (Array.isArray(goals) && goals.length > 0) {
            const rows = goals
              .filter(g => g && g.name)
              .map(g => ({
                user_id: user.id,
                name: g.name,
                target_amount: g.targetAmount || 0,
                current_amount: g.currentAmount || 0,
                deadline: g.deadline ? safeDate(g.deadline) : null,
                monthly_salary: g.monthlySalary || null,
                fixed_expenses: g.fixedExpenses || null,
                variable_expenses: g.variableExpenses || null,
                status: g.status || 'active'
              }));
            if (rows.length > 0) {
              const { error } = await supabase.from('goals').insert(rows);
              if (error && error.code !== '23505') {
                console.error('Error migrating goals:', error);
              }
            }
          }
        } catch (e) {
          console.error('Error parsing goals:', e);
        }
      }

      // 9. Update profile (total money + mark as onboarded) — LAST step
      const totalAdded = localTotalAdded ? parseFloat(localTotalAdded) : 0;
      await FinanceAPI.updateProfile({
        total_money_added: totalAdded,
        onboarding_completed: true
      });

      console.log('Migration completed successfully.');
      return true;
    } catch (err) {
      console.error('Migration failed:', err);
      return false;
    }
  }
};
