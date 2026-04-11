import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Expense, WalletTransaction, SavingsGameCell, FinancialGoal } from '@/types/finance';
import { supabase } from '@/lib/supabase';

interface FinanceContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{success: boolean, error?: string}>;
  signup: (email: string, password: string, name: string) => Promise<{success: boolean, needsVerification?: boolean, error?: string}>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthLoading: boolean;
  
  // Wallet — balance = totalMoneyAdded - total expenses
  walletBalance: number;
  totalMoneyAdded: number;
  addToWallet: (amount: number, description: string) => void;
  walletTransactions: WalletTransaction[];
  
  // Expenses
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  
  // Monthly stats
  monthlyExpensesTotal: number;
  monthlyExpenses: Expense[];
  
  // Savings Game — completely isolated from wallet
  savingsGame: SavingsGameCell[];
  completeSavingsCell: (cellId: number) => void;
  gameSavingsTotal: number;   // amount tracked in the game (NOT wallet)
  gameSavingsRemaining: number;
  savingsTarget: number;
  currentDay: number;
  
  // Goals
  goals: FinancialGoal[];
  addGoal: (goal: Omit<FinancialGoal, 'id' | 'createdAt' | 'status' | 'currentAmount'>) => void;
  updateGoal: (id: string, goal: Partial<FinancialGoal>) => void;
  deleteGoal: (id: string) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Generate 90 random cells for savings game
const generateSavingsGame = (): SavingsGameCell[] => {
  const values: (100 | 200 | 500)[] = [100, 200, 500];
  return Array.from({ length: 90 }, (_, i) => ({
    id: i + 1,
    value: values[Math.floor(Math.random() * 3)],
    completed: false,
  }));
};

// Current month helper
const isCurrentMonth = (dateStr: string): boolean => {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

// Default sample expenses — use current month dates so monthly stats show real data
const now = new Date();
const curMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
const sampleExpenses: Expense[] = [
  { id: '1', amount: 450,   category: 'food',     description: 'Grocery shopping', date: `${curMonth}-15`, notes: 'Weekly groceries' },
  { id: '2', amount: 2500,  category: 'travel',   description: 'Uber rides',        date: `${curMonth}-14` },
  { id: '3', amount: 15000, category: 'rent',     description: 'Monthly rent',      date: `${curMonth}-01` },
  { id: '4', amount: 3200,  category: 'shopping', description: 'Amazon order',      date: `${curMonth}-12` },
  { id: '5', amount: 1800,  category: 'bills',    description: 'Electricity bill',  date: `${curMonth}-10` },
  { id: '6', amount: 850,   category: 'food',     description: 'Restaurant dinner', date: `${curMonth}-13` },
  { id: '7', amount: 500,   category: 'others',   description: 'Miscellaneous',     date: `${curMonth}-11` },
];

const INITIAL_WALLET_AMOUNT = 50000; // seeded starting deposit so balance shows positive

// LocalStorage helpers
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function saveToStorage(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [totalMoneyAdded, setTotalMoneyAdded] = useState<number>(() =>
    loadFromStorage('fintrax-total-added', INITIAL_WALLET_AMOUNT)
  );
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>(() =>
    loadFromStorage('fintrax-wallet-txns', [])
  );
  const [expenses, setExpenses] = useState<Expense[]>(() =>
    loadFromStorage('fintrax-expenses', sampleExpenses)
  );
  const [savingsGame, setSavingsGame] = useState<SavingsGameCell[]>(() =>
    loadFromStorage('fintrax-savings-game', generateSavingsGame())
  );
  const [goals, setGoals] = useState<FinancialGoal[]>(() =>
    loadFromStorage('fintrax-goals', [])
  );

  const savingsTarget = 100000;

  // ── Derived: wallet balance = money added - all expenses ──
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const walletBalance = totalMoneyAdded - totalExpenses;

  // ── Derived: savings game (fully isolated from wallet) ──
  const gameSavingsTotal = savingsGame.filter(c => c.completed).reduce((sum, c) => sum + c.value, 0);
  const gameSavingsRemaining = savingsTarget - gameSavingsTotal;
  const currentDay = savingsGame.filter(c => c.completed).length + 1;

  // ── Derived: monthly stats ──
  const monthlyExpenses = expenses.filter(e => isCurrentMonth(e.date));
  const monthlyExpensesTotal = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  // ── Persistence side-effects ──
  useEffect(() => { saveToStorage('fintrax-total-added', totalMoneyAdded); }, [totalMoneyAdded]);
  useEffect(() => { saveToStorage('fintrax-wallet-txns', walletTransactions); }, [walletTransactions]);
  useEffect(() => { saveToStorage('fintrax-expenses', expenses); }, [expenses]);
  useEffect(() => { saveToStorage('fintrax-savings-game', savingsGame); }, [savingsGame]);
  useEffect(() => { saveToStorage('fintrax-goals', goals); }, [goals]);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const newUser: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
          walletBalance: 0,
        };
        setUser(newUser);
        localStorage.setItem('fintrax-user', JSON.stringify(newUser));
      } else {
        const stored = localStorage.getItem('fintrax-user');
        if (stored) setUser(JSON.parse(stored));
      }
      setIsAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const newUser: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
          walletBalance: 0,
        };
        setUser(newUser);
        localStorage.setItem('fintrax-user', JSON.stringify(newUser));
      } else {
        setUser(null);
        localStorage.removeItem('fintrax-user');
      }
      setIsAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Auth ──
  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error(error);
      return { success: false, error: error.message };
    }
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
    if (error) {
      console.error(error);
      return { success: false, error: error.message };
    }
    const needsVerification = data.user && data.session === null;
    return { success: true, needsVerification: !!needsVerification };
  };

  const loginWithGoogle = async (): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard',
      }
    });
    if (error) {
      console.error(error);
    }
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('fintrax-user');
  };

  // ── Wallet ──
  const addToWallet = (amount: number, description: string) => {
    setTotalMoneyAdded(prev => prev + amount);
    setWalletTransactions(prev => [...prev, {
      id: Date.now().toString(),
      amount,
      type: 'add',
      description,
      date: new Date().toISOString(),
    }]);
  };

  // ── Expenses — adding an expense auto-reduces walletBalance via derived computation ──
  const addExpense = (expense: Omit<Expense, 'id'>) => {
    setExpenses(prev => [...prev, { ...expense, id: Date.now().toString() }]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const updateExpense = (id: string, expense: Partial<Expense>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...expense } : e));
  };

  // ── Savings Game — DOES NOT touch wallet ──
  const completeSavingsCell = (cellId: number) => {
    const cell = savingsGame.find(c => c.id === cellId);
    if (cell && !cell.completed) {
      setSavingsGame(prev => prev.map(c =>
        c.id === cellId ? { ...c, completed: true, completedDate: new Date().toISOString() } : c
      ));
      // ✅ No wallet deduction — game is completely separate
    }
  };

  // ── Goals ──
  const addGoal = (goal: Omit<FinancialGoal, 'id' | 'createdAt' | 'status' | 'currentAmount'>) => {
    setGoals(prev => [...prev, {
      ...goal, id: Date.now().toString(),
      createdAt: new Date().toISOString(), status: 'active', currentAmount: 0,
    }]);
  };

  const updateGoal = (id: string, goal: Partial<FinancialGoal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...goal } : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
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
