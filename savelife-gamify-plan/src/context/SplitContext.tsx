import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SplitGroup, GroupMember, GroupExpense, Settlement, Balance, ExpenseSplit } from '@/types/splitwise';

interface DebtSummaryItem {
  name: string;
  amount: number;
  direction: 'owe' | 'owedBy';
}

interface SplitContextType {
  groups: SplitGroup[];
  expenses: GroupExpense[];
  settlements: Settlement[];

  // Group operations
  createGroup: (group: Omit<SplitGroup, 'id' | 'createdAt'>) => void;
  updateGroup: (id: string, updates: Partial<SplitGroup>) => void;
  deleteGroup: (id: string) => void;
  addMemberToGroup: (groupId: string, member: Omit<GroupMember, 'id'>) => void;
  removeMemberFromGroup: (groupId: string, memberId: string) => void;

  // Expense operations
  addGroupExpense: (expense: Omit<GroupExpense, 'id' | 'createdAt'>) => void;
  updateGroupExpense: (id: string, updates: Partial<GroupExpense>) => void;
  deleteGroupExpense: (id: string) => void;

  // Settlement operations
  settleUp: (settlement: Omit<Settlement, 'id'>) => void;

  // Balance calculations (per group)
  calculateGroupBalances: (groupId: string) => Balance[];
  calculateSimplifiedBalances: (groupId: string) => Balance[];
  getMemberBalance: (groupId: string, memberId: string) => number;
  getGroupTotalSpend: (groupId: string) => number;

  // Cross-group aggregation
  getMyTotalOwed: (myId: string) => number;
  getMyTotalOwedToMe: (myId: string) => number;
  getMyDebtSummary: (myId: string) => DebtSummaryItem[];
  getAllMemberName: (memberId: string) => string;
}

const SplitContext = createContext<SplitContextType | undefined>(undefined);

// Sample data
const sampleMembers: GroupMember[] = [
  { id: 'me', name: 'You', email: 'you@example.com' },
  { id: 'm1', name: 'Rahul', email: 'rahul@example.com' },
  { id: 'm2', name: 'Priya', email: 'priya@example.com' },
  { id: 'm3', name: 'Amit', email: 'amit@example.com' },
];

const sampleGroups: SplitGroup[] = [
  {
    id: 'g1', name: 'Goa Trip 2024', type: 'trip',
    members: sampleMembers, createdAt: '2024-01-01', createdBy: 'me',
  },
  {
    id: 'g2', name: 'Flat Expenses', type: 'flat',
    members: [sampleMembers[0], sampleMembers[1], sampleMembers[2]],
    createdAt: '2024-01-01', createdBy: 'me',
  },
];

const sampleExpenses: GroupExpense[] = [
  {
    id: 'e1', groupId: 'g1', amount: 4000, description: 'Hotel booking', category: 'travel',
    paidBy: [{ memberId: 'me', amount: 4000 }], splitType: 'equal',
    splits: sampleMembers.map(m => ({ memberId: m.id, amount: 1000 })),
    date: '2024-01-10', createdAt: '2024-01-10',
  },
  {
    id: 'e2', groupId: 'g1', amount: 2000, description: 'Dinner at Beach Shack', category: 'food',
    paidBy: [{ memberId: 'm1', amount: 2000 }], splitType: 'equal',
    splits: sampleMembers.map(m => ({ memberId: m.id, amount: 500 })),
    date: '2024-01-11', createdAt: '2024-01-11',
  },
  {
    id: 'e3', groupId: 'g2', amount: 6000, description: 'Monthly Rent', category: 'rent',
    paidBy: [{ memberId: 'me', amount: 6000 }], splitType: 'equal',
    splits: [
      { memberId: 'me', amount: 2000 },
      { memberId: 'm1', amount: 2000 },
      { memberId: 'm2', amount: 2000 },
    ],
    date: '2024-01-01', createdAt: '2024-01-01',
  },
];

export function SplitProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<SplitGroup[]>(sampleGroups);
  const [expenses, setExpenses] = useState<GroupExpense[]>(sampleExpenses);
  const [settlements, setSettlements] = useState<Settlement[]>([]);

  const createGroup = (group: Omit<SplitGroup, 'id' | 'createdAt'>) => {
    const newGroup: SplitGroup = { ...group, id: Date.now().toString(), createdAt: new Date().toISOString() };
    setGroups(prev => [...prev, newGroup]);
  };

  const updateGroup = (id: string, updates: Partial<SplitGroup>) => {
    setGroups(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const deleteGroup = (id: string) => {
    setGroups(prev => prev.filter(g => g.id !== id));
    setExpenses(prev => prev.filter(e => e.groupId !== id));
    setSettlements(prev => prev.filter(s => s.groupId !== id));
  };

  const addMemberToGroup = (groupId: string, member: Omit<GroupMember, 'id'>) => {
    const newMember: GroupMember = { ...member, id: Date.now().toString() };
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, members: [...g.members, newMember] } : g));
  };

  const removeMemberFromGroup = (groupId: string, memberId: string) => {
    setGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, members: g.members.filter(m => m.id !== memberId) } : g
    ));
  };

  const addGroupExpense = (expense: Omit<GroupExpense, 'id' | 'createdAt'>) => {
    const newExpense: GroupExpense = { ...expense, id: Date.now().toString(), createdAt: new Date().toISOString() };
    setExpenses(prev => [...prev, newExpense]);
  };

  const updateGroupExpense = (id: string, updates: Partial<GroupExpense>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteGroupExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const settleUp = (settlement: Omit<Settlement, 'id'>) => {
    const newSettlement: Settlement = { ...settlement, id: Date.now().toString() };
    setSettlements(prev => [...prev, newSettlement]);
  };

  // Calculate raw balances for a group
  const calculateGroupBalances = (groupId: string): Balance[] => {
    const groupExpenses = expenses.filter(e => e.groupId === groupId);
    const groupSettlements = settlements.filter(s => s.groupId === groupId);
    const balances: Record<string, Record<string, number>> = {};

    for (const expense of groupExpenses) {
      for (const payer of expense.paidBy) {
        for (const split of expense.splits) {
          if (payer.memberId !== split.memberId) {
            const payerShare = (payer.amount / expense.amount) * split.amount;
            if (!balances[split.memberId]) balances[split.memberId] = {};
            if (!balances[split.memberId][payer.memberId]) balances[split.memberId][payer.memberId] = 0;
            balances[split.memberId][payer.memberId] += payerShare;
          }
        }
      }
    }

    for (const settlement of groupSettlements) {
      if (!balances[settlement.from]) balances[settlement.from] = {};
      if (!balances[settlement.from][settlement.to]) balances[settlement.from][settlement.to] = 0;
      balances[settlement.from][settlement.to] -= settlement.amount;
    }

    const result: Balance[] = [];
    const processed = new Set<string>();

    for (const from in balances) {
      for (const to in balances[from]) {
        const key = [from, to].sort().join('-');
        if (processed.has(key)) continue;
        processed.add(key);

        const fromTo = balances[from]?.[to] || 0;
        const toFrom = balances[to]?.[from] || 0;
        const net = fromTo - toFrom;

        if (Math.abs(net) > 0.01) {
          if (net > 0) result.push({ from, to, amount: Math.round(net * 100) / 100 });
          else result.push({ from: to, to: from, amount: Math.round(-net * 100) / 100 });
        }
      }
    }
    return result;
  };

  // Simplify debts using minimum transactions
  const calculateSimplifiedBalances = (groupId: string): Balance[] => {
    const rawBalances = calculateGroupBalances(groupId);
    const group = groups.find(g => g.id === groupId);
    if (!group) return [];

    const netBalance: Record<string, number> = {};
    for (const member of group.members) netBalance[member.id] = 0;

    for (const balance of rawBalances) {
      netBalance[balance.from] = (netBalance[balance.from] || 0) - balance.amount;
      netBalance[balance.to] = (netBalance[balance.to] || 0) + balance.amount;
    }

    const creditors: { id: string; amount: number }[] = [];
    const debtors: { id: string; amount: number }[] = [];

    for (const [id, amount] of Object.entries(netBalance)) {
      if (amount > 0.01) creditors.push({ id, amount });
      else if (amount < -0.01) debtors.push({ id, amount: -amount });
    }

    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    const simplified: Balance[] = [];
    let i = 0, j = 0;

    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i];
      const debtor = debtors[j];
      const settleAmount = Math.min(creditor.amount, debtor.amount);

      if (settleAmount > 0.01) {
        simplified.push({
          from: debtor.id, to: creditor.id,
          amount: Math.round(settleAmount * 100) / 100,
        });
      }

      creditor.amount -= settleAmount;
      debtor.amount -= settleAmount;
      if (creditor.amount < 0.01) i++;
      if (debtor.amount < 0.01) j++;
    }

    return simplified;
  };

  const getMemberBalance = (groupId: string, memberId: string): number => {
    const balances = calculateSimplifiedBalances(groupId);
    let balance = 0;
    for (const b of balances) {
      if (b.to === memberId) balance += b.amount;
      if (b.from === memberId) balance -= b.amount;
    }
    return balance;
  };

  const getGroupTotalSpend = (groupId: string): number =>
    expenses.filter(e => e.groupId === groupId).reduce((sum, e) => sum + e.amount, 0);

  // ── Cross-group aggregation ──

  /** Build a member name lookup from all groups */
  const getAllMemberName = (memberId: string): string => {
    for (const g of groups) {
      const m = g.members.find(m => m.id === memberId);
      if (m) return m.name;
    }
    return memberId;
  };

  /** How much myId owes others, across all groups */
  const getMyTotalOwed = (myId: string): number => {
    let total = 0;
    for (const g of groups) {
      const balances = calculateSimplifiedBalances(g.id);
      for (const b of balances) {
        if (b.from === myId) total += b.amount;
      }
    }
    return Math.round(total * 100) / 100;
  };

  /** How much others owe myId, across all groups */
  const getMyTotalOwedToMe = (myId: string): number => {
    let total = 0;
    for (const g of groups) {
      const balances = calculateSimplifiedBalances(g.id);
      for (const b of balances) {
        if (b.to === myId) total += b.amount;
      }
    }
    return Math.round(total * 100) / 100;
  };

  /** Per-person aggregated debt summary across all groups */
  const getMyDebtSummary = (myId: string): DebtSummaryItem[] => {
    const personMap: Record<string, number> = {}; // positive = they owe me, negative = I owe them

    for (const g of groups) {
      const balances = calculateSimplifiedBalances(g.id);
      for (const b of balances) {
        if (b.from === myId) {
          // I owe b.to
          personMap[b.to] = (personMap[b.to] || 0) - b.amount;
        } else if (b.to === myId) {
          // b.from owes me
          personMap[b.from] = (personMap[b.from] || 0) + b.amount;
        }
      }
    }

    return Object.entries(personMap)
      .filter(([, amount]) => Math.abs(amount) > 0.01)
      .map(([id, amount]) => ({
        name: getAllMemberName(id),
        amount: Math.abs(Math.round(amount * 100) / 100),
        direction: (amount > 0 ? 'owedBy' : 'owe') as 'owe' | 'owedBy',
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  return (
    <SplitContext.Provider value={{
      groups, expenses, settlements,
      createGroup, updateGroup, deleteGroup,
      addMemberToGroup, removeMemberFromGroup,
      addGroupExpense, updateGroupExpense, deleteGroupExpense,
      settleUp,
      calculateGroupBalances, calculateSimplifiedBalances,
      getMemberBalance, getGroupTotalSpend,
      getMyTotalOwed, getMyTotalOwedToMe, getMyDebtSummary,
      getAllMemberName,
    }}>
      {children}
    </SplitContext.Provider>
  );
}

export function useSplit() {
  const context = useContext(SplitContext);
  if (!context) throw new Error('useSplit must be used within a SplitProvider');
  return context;
}
