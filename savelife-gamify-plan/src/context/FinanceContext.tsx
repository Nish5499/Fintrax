import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { User, Expense, WalletTransaction, SavingsGameCell, FinancialGoal } from '@/types/finance';
import { supabase } from '@/lib/supabase';
import { FinanceAPI } from '@/lib/services/api';
import { MigrationService } from '@/lib/services/migration';

interface FinanceContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{success: boolean, error?: string}>;
  signup: (email: string, password: string, name: string) => Promise<{success: boolean, needsVerification?: boolean, error?: string}>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthLoading: boolean;
  
  // Wallet
  walletBalance: number;
  totalMoneyAdded: number;
  addToWallet: (amount: number, description: string) => Promise<void>;
  walletTransactions: WalletTransaction[];
  
  // Expenses
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  
  // Monthly stats
  monthlyExpensesTotal: number;
  monthlyExpenses: Expense[];
  
  // Savings Game
  savingsGame: SavingsGameCell[];
  completeSavingsCell: (cellId: number) => Promise<void>;
  gameSavingsTotal: number;
  gameSavingsRemaining: number;
  savingsTarget: number;
  currentDay: number;
  
  // Goals
  goals: FinancialGoal[];
  addGoal: (goal: Omit<FinancialGoal, 'id' | 'createdAt' | 'status' | 'currentAmount'>) => Promise<void>;
  updateGoal: (id: string, goal: Partial<FinancialGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Generate 90 random cells for savings game (fallback if empty)
const generateSavingsGame = (): SavingsGameCell[] => {
  const values: (100 | 200 | 500)[] = [100, 200, 500];
  return Array.from({ length: 90 }, (_, i) => ({
    id: i + 1,
    value: values[Math.floor(Math.random() * 3)],
    completed: false,
  }));
};

const isCurrentMonth = (dateStr: string): boolean => {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  const [totalMoneyAdded, setTotalMoneyAdded] = useState<number>(0);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [savingsGame, setSavingsGame] = useState<SavingsGameCell[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);

  const migrationInProgressRef = useRef(false);
  const hasMigratedRef = useRef(false);

  const savingsTarget = 100000;

  const loadData = useCallback(async () => {
    try {
      const [profile, txns, game, dbGoals] = await Promise.all([
        FinanceAPI.ensureProfile(),
        FinanceAPI.fetchTransactions(),
        FinanceAPI.fetchSavingsGame(),
        FinanceAPI.fetchGoals()
      ]);

      if (profile) {
        setTotalMoneyAdded(profile.total_money_added || 0);
      }

      if (txns) {
        const adds = txns.filter(t => t.type === 'add').map(t => ({
          id: t.id,
          amount: t.amount,
          type: 'add' as const,
          description: t.description,
          date: t.date
        }));
        setWalletTransactions(adds);

        const exp = txns.filter(t => t.type === 'deduct').map(t => ({
          id: t.id,
          amount: t.amount,
          category: t.category as any,
          description: t.description,
          date: t.date,
          notes: t.notes
        }));
        setExpenses(exp);
      }

      if (game && game.length > 0) {
        // Map from DB schema to frontend schema
        const mappedGame = game.map(g => ({
          id: g.cell_id,
          value: g.value as any,
          completed: g.completed,
          completedDate: g.completed_date
        }));
        // Merge with full 90-cell board if missing cells
        const fullBoard = generateSavingsGame().map(c => {
          const found = mappedGame.find(mg => mg.id === c.id);
          return found ? found : c;
        });
        setSavingsGame(fullBoard);
      } else {
        setSavingsGame(generateSavingsGame());
      }

      if (dbGoals) {
        const mappedGoals = dbGoals.map(g => ({
          id: g.id,
          name: g.name,
          targetAmount: g.target_amount,
          currentAmount: g.current_amount,
          deadline: g.deadline,
          monthlySalary: g.monthly_salary,
          fixedExpenses: g.fixed_expenses,
          variableExpenses: g.variable_expenses,
          status: g.status as any,
          createdAt: g.created_at
        }));
        setGoals(mappedGoals);
      }
    } catch (error) {
      console.error('Failed to load finance data:', error);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const newUser: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
          walletBalance: 0,
        };
        setUser(newUser);
        if (!migrationInProgressRef.current && !hasMigratedRef.current) {
          migrationInProgressRef.current = true;
          try {
            await MigrationService.migrateLocalDataToSupabase();
            hasMigratedRef.current = true;
          } finally {
            migrationInProgressRef.current = false;
          }
          await loadData();
        }
      }
      setIsAuthLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const newUser: User = {
          id: session?.user.id || '',
          email: session?.user.email || '',
          name: session?.user.user_metadata?.full_name || session?.user.email?.split('@')[0] || '',
          walletBalance: 0,
        };
        setUser(newUser);
        if (!migrationInProgressRef.current && !hasMigratedRef.current) {
          migrationInProgressRef.current = true;
          try {
            await MigrationService.migrateLocalDataToSupabase();
            hasMigratedRef.current = true;
          } finally {
            migrationInProgressRef.current = false;
          }
          await loadData();
        } else if (hasMigratedRef.current) {
          await loadData();
        }
      } else if (event === 'SIGNED_OUT') {
        hasMigratedRef.current = false;
        setUser(null);
        setTotalMoneyAdded(0);
        setWalletTransactions([]);
        setExpenses([]);
        setSavingsGame(generateSavingsGame());
        setGoals([]);
      }
      setIsAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadData]);

  // ── Derived State ──
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const walletBalance = totalMoneyAdded - totalExpenses;

  const gameSavingsTotal = savingsGame.filter(c => c.completed).reduce((sum, c) => sum + c.value, 0);
  const gameSavingsRemaining = savingsTarget - gameSavingsTotal;
  const currentDay = savingsGame.filter(c => c.completed).length + 1;

  const monthlyExpenses = expenses.filter(e => isCurrentMonth(e.date));
  const monthlyExpensesTotal = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  // ── Auth ──
  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const signup = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { full_name: name },
        emailRedirectTo: window.location.origin + '/auth',
      }
    });
    if (error) return { success: false, error: error.message };
    const needsVerification = data.user && data.session === null;
    return { success: true, needsVerification: !!needsVerification };
  };

  const loginWithGoogle = async (): Promise<void> => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard' }
    });
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
  };

  // ── Wallet ──
  const addToWallet = async (amount: number, description: string) => {
    const newTotal = totalMoneyAdded + amount;
    
    // Optimistic UI
    setTotalMoneyAdded(newTotal);
    const tempTxn = {
      id: Date.now().toString(),
      amount,
      type: 'add' as const,
      description,
      date: new Date().toISOString()
    };
    setWalletTransactions(prev => [tempTxn, ...prev]);

    try {
      await FinanceAPI.updateProfile({ total_money_added: newTotal });
      const dbTxn = await FinanceAPI.addTransaction({
        amount,
        type: 'add',
        description,
        date: new Date().toISOString()
      });
      // Replace optimistic txn with real one
      setWalletTransactions(prev => prev.map(t => t.id === tempTxn.id ? { ...tempTxn, id: dbTxn.id } : t));
    } catch (err) {
      console.error(err);
      // Revert optimistic update
      setTotalMoneyAdded(prev => prev - amount);
      setWalletTransactions(prev => prev.filter(t => t.id !== tempTxn.id));
    }
  };

  // ── Expenses ──
  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    const tempId = Date.now().toString();
    const tempExpense = { ...expense, id: tempId };
    setExpenses(prev => [tempExpense, ...prev]);

    try {
      const dbTxn = await FinanceAPI.addTransaction({
        amount: expense.amount,
        type: 'deduct',
        category: expense.category,
        description: expense.description,
        notes: expense.notes,
        date: expense.date
      });
      setExpenses(prev => prev.map(e => e.id === tempId ? { ...e, id: dbTxn.id } : e));
    } catch (err) {
      console.error(err);
      setExpenses(prev => prev.filter(e => e.id !== tempId));
    }
  };

  const deleteExpense = async (id: string) => {
    const prevExpenses = [...expenses];
    setExpenses(prev => prev.filter(e => e.id !== id));

    try {
      await FinanceAPI.deleteTransaction(id);
    } catch (err) {
      console.error(err);
      setExpenses(prevExpenses);
    }
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    const prevExpenses = [...expenses];
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));

    try {
      await FinanceAPI.updateTransaction(id, updates);
    } catch (err) {
      console.error(err);
      setExpenses(prevExpenses);
    }
  };

  // ── Savings Game ──
  const completeSavingsCell = async (cellId: number) => {
    const cell = savingsGame.find(c => c.id === cellId);
    if (!cell || cell.completed) return;

    const prevGame = [...savingsGame];
    setSavingsGame(prev => prev.map(c => 
      c.id === cellId ? { ...c, completed: true, completedDate: new Date().toISOString() } : c
    ));

    try {
      await FinanceAPI.updateSavingsGameCell(cellId, { 
        value: cell.value,
        completed: true, 
        completed_date: new Date().toISOString() 
      });
    } catch (err) {
      console.error(err);
      setSavingsGame(prevGame);
    }
  };

  // ── Goals ──
  const addGoal = async (goal: Omit<FinancialGoal, 'id' | 'createdAt' | 'status' | 'currentAmount'>) => {
    const tempId = Date.now().toString();
    const tempGoal: FinancialGoal = {
      ...goal, id: tempId, createdAt: new Date().toISOString(), status: 'active', currentAmount: 0
    };
    setGoals(prev => [...prev, tempGoal]);

    try {
      const dbGoal = await FinanceAPI.addGoal({
        name: goal.name,
        target_amount: goal.targetAmount,
        deadline: goal.deadline,
        monthly_salary: goal.monthlySalary,
        fixed_expenses: goal.fixedExpenses,
        variable_expenses: goal.variableExpenses
      });
      setGoals(prev => prev.map(g => g.id === tempId ? { ...g, id: dbGoal.id } : g));
    } catch (err) {
      console.error(err);
      setGoals(prev => prev.filter(g => g.id !== tempId));
    }
  };

  const updateGoal = async (id: string, updates: Partial<FinancialGoal>) => {
    const prevGoals = [...goals];
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));

    try {
      // map camelCase to snake_case for Supabase
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.targetAmount !== undefined) dbUpdates.target_amount = updates.targetAmount;
      if (updates.currentAmount !== undefined) dbUpdates.current_amount = updates.currentAmount;
      if (updates.deadline) dbUpdates.deadline = updates.deadline;
      if (updates.status) dbUpdates.status = updates.status;

      await FinanceAPI.updateGoal(id, dbUpdates);
    } catch (err) {
      console.error(err);
      setGoals(prevGoals);
    }
  };

  const deleteGoal = async (id: string) => {
    const prevGoals = [...goals];
    setGoals(prev => prev.filter(g => g.id !== id));

    try {
      await FinanceAPI.deleteGoal(id);
    } catch (err) {
      console.error(err);
      setGoals(prevGoals);
    }
  };

  return (
    <FinanceContext.Provider value={{
      user, setUser,
      isAuthenticated: !!user,
      isAuthLoading,
      login, signup, loginWithGoogle, logout,
      walletBalance, totalMoneyAdded,
      addToWallet, walletTransactions,
      expenses, addExpense, deleteExpense, updateExpense,
      monthlyExpensesTotal, monthlyExpenses,
      savingsGame, completeSavingsCell,
      gameSavingsTotal, gameSavingsRemaining,
      savingsTarget, currentDay,
      goals, addGoal, updateGoal, deleteGoal,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within a FinanceProvider');
  return context;
}
