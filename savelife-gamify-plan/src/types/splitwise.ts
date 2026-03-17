export type SplitType = 'equal' | 'exact' | 'percentage' | 'shares';

export interface GroupMember {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface SplitGroup {
  id: string;
  name: string;
  type: 'trip' | 'flat' | 'friends' | 'office' | 'other';
  members: GroupMember[];
  createdAt: string;
  createdBy: string;
}

export interface ExpenseSplit {
  memberId: string;
  amount: number;
  percentage?: number;
  shares?: number;
}

export interface GroupExpense {
  id: string;
  groupId: string;
  amount: number;
  description: string;
  category: string;
  paidBy: { memberId: string; amount: number }[];
  splitType: SplitType;
  splits: ExpenseSplit[];
  date: string;
  notes?: string;
  createdAt: string;
}

export interface Balance {
  from: string;
  to: string;
  amount: number;
}

export interface Settlement {
  id: string;
  groupId: string;
  from: string;
  to: string;
  amount: number;
  paymentMode: 'cash' | 'upi' | 'wallet';
  date: string;
  notes?: string;
}

export const GROUP_TYPE_ICONS: Record<SplitGroup['type'], string> = {
  trip: '✈️',
  flat: '🏠',
  friends: '👥',
  office: '💼',
  other: '📦',
};

export const GROUP_TYPE_LABELS: Record<SplitGroup['type'], string> = {
  trip: 'Trip',
  flat: 'Flat',
  friends: 'Friends',
  office: 'Office',
  other: 'Other',
};
