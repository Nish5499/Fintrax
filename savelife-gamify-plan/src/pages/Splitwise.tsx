import { useState } from 'react';
import { useSplit } from '@/context/SplitContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus, Users, Receipt, ArrowRight, ChevronRight, Trash2,
  UserPlus, CheckCircle2, ArrowLeftRight, Wallet, TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { SplitGroup, GroupExpense, ExpenseSplit, SplitType, GROUP_TYPE_ICONS, GROUP_TYPE_LABELS } from '@/types/splitwise';
import { cn } from '@/lib/utils';
import { CATEGORY_ICONS, CATEGORY_LABELS, ExpenseCategory } from '@/types/finance';

export default function Splitwise() {
  const {
    groups, expenses, settlements, createGroup, deleteGroup,
    addGroupExpense, deleteGroupExpense, settleUp,
    addMemberToGroup, removeMemberFromGroup,
    calculateSimplifiedBalances, getMemberBalance, getGroupTotalSpend
  } = useSplit();

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  // Always derive from live `groups` so it stays fresh after every context update
  const selectedGroup = selectedGroupId ? groups.find(g => g.id === selectedGroupId) ?? null : null;
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSettleOpen, setIsSettleOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  const [newGroup, setNewGroup] = useState({
    name: '',
    type: 'friends' as SplitGroup['type'],
  });

  const [newMember, setNewMember] = useState({ name: '', email: '' });

  const [newExpense, setNewExpense] = useState({
    amount: '',
    description: '',
    category: 'food' as ExpenseCategory,
    paidBy: 'me',
    splitType: 'equal' as SplitType,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [settleData, setSettleData] = useState({
    from: '',
    to: '',
    amount: '',
    paymentMode: 'upi' as 'cash' | 'upi' | 'wallet',
  });

  const handleCreateGroup = () => {
    if (!newGroup.name) {
      toast.error('Please enter a group name');
      return;
    }

    createGroup({
      name: newGroup.name,
      type: newGroup.type,
      members: [{ id: 'me', name: 'You', email: 'you@example.com' }],
      createdBy: 'me',
    });

    toast.success('Group created!');
    setNewGroup({ name: '', type: 'friends' });
    setIsCreateGroupOpen(false);
  };

  const handleAddMember = () => {
    if (!newMember.name || !selectedGroup) {
      toast.error('Please enter member name');
      return;
    }

    addMemberToGroup(selectedGroup.id, { name: newMember.name, email: newMember.email });
    toast.success(`${newMember.name} added to group`);
    setNewMember({ name: '', email: '' });
    setIsAddMemberOpen(false);
    // No manual refresh needed — selectedGroup is derived from live `groups` array
  };

  const handleAddExpense = () => {
    if (!selectedGroup || !newExpense.amount || !newExpense.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(newExpense.amount);
    const members = selectedGroup.members;

    // Calculate splits based on split type
    let splits: ExpenseSplit[] = [];
    if (newExpense.splitType === 'equal') {
      const share = amount / members.length;
      splits = members.map(m => ({ memberId: m.id, amount: share }));
    }

    addGroupExpense({
      groupId: selectedGroup.id,
      amount,
      description: newExpense.description,
      category: newExpense.category,
      paidBy: [{ memberId: newExpense.paidBy, amount }],
      splitType: newExpense.splitType,
      splits,
      date: newExpense.date,
      notes: newExpense.notes,
    });

    toast.success('Expense added!');
    setNewExpense({
      amount: '',
      description: '',
      category: 'food',
      paidBy: 'me',
      splitType: 'equal',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setIsAddExpenseOpen(false);
  };

  const handleSettle = () => {
    if (!selectedGroup || !settleData.from || !settleData.to || !settleData.amount) {
      toast.error('Please fill in all fields');
      return;
    }

    settleUp({
      groupId: selectedGroup.id,
      from: settleData.from,
      to: settleData.to,
      amount: parseFloat(settleData.amount),
      paymentMode: settleData.paymentMode,
      date: new Date().toISOString(),
    });

    toast.success('Settlement recorded!');
    setSettleData({ from: '', to: '', amount: '', paymentMode: 'upi' });
    setIsSettleOpen(false);
  };

  // Group Detail View
  if (selectedGroup) {
    const groupExpenses = expenses.filter(e => e.groupId === selectedGroup.id);
    const balances = calculateSimplifiedBalances(selectedGroup.id);
    const totalSpend = getGroupTotalSpend(selectedGroup.id);

    const getMemberName = (id: string) => {
      const member = selectedGroup.members.find(m => m.id === id);
      return member?.name || id;
    };

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="gradient-card border-b border-border/50 p-6">
          <button
            onClick={() => setSelectedGroupId(null)}
            className="flex items-center gap-2 text-muted-foreground mb-4 hover:text-foreground transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Groups
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">
                {GROUP_TYPE_ICONS[selectedGroup.type]}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{selectedGroup.name}</h1>
                <p className="text-muted-foreground">{selectedGroup.members.length} members</p>
              </div>
            </div>
            <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <UserPlus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="glass border-border">
                <DialogHeader>
                  <DialogTitle>Add Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="Name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  />
                  <Input
                    placeholder="Email (optional)"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  />
                  <Button variant="hero" className="w-full" onClick={handleAddMember}>
                    Add Member
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Summary Card */}
          <Card className="gradient-primary border-0 mt-4">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-primary-foreground/70 text-sm">Total Spend</p>
                  <p className="text-2xl font-bold text-primary-foreground">₹{totalSpend.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-primary-foreground/70 text-sm">Your Balance</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    getMemberBalance(selectedGroup.id, 'me') >= 0 ? "text-primary-foreground" : "text-destructive"
                  )}>
                    {getMemberBalance(selectedGroup.id, 'me') >= 0 ? '+' : ''}
                    ₹{Math.abs(getMemberBalance(selectedGroup.id, 'me')).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </header>

        <main className="p-6 space-y-6">
          <Tabs defaultValue="expenses" className="w-full">
            <TabsList className="w-full bg-secondary">
              <TabsTrigger value="expenses" className="flex-1">Expenses</TabsTrigger>
              <TabsTrigger value="balances" className="flex-1">Balances</TabsTrigger>
              <TabsTrigger value="members" className="flex-1">Members</TabsTrigger>
            </TabsList>

            {/* Expenses Tab */}
            <TabsContent value="expenses" className="mt-4 space-y-4">
              <div className="flex gap-2">
                <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
                  <DialogTrigger asChild>
                    <Button variant="hero" className="flex-1 gap-2">
                      <Plus className="w-4 h-4" />
                      Add Expense
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass border-border max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add Expense</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Amount (₹)</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={newExpense.amount}
                          onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                          className="text-2xl font-bold h-16"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Description</label>
                        <Input
                          placeholder="What was this for?"
                          value={newExpense.description}
                          onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Category</label>
                        <Select
                          value={newExpense.category}
                          onValueChange={(value: ExpenseCategory) => setNewExpense({ ...newExpense, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                <span className="flex items-center gap-2">
                                  <span>{CATEGORY_ICONS[key as ExpenseCategory]}</span>
                                  {label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Paid By</label>
                        <Select
                          value={newExpense.paidBy}
                          onValueChange={(value) => setNewExpense({ ...newExpense, paidBy: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedGroup.members.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Split Type</label>
                        <Select
                          value={newExpense.splitType}
                          onValueChange={(value: SplitType) => setNewExpense({ ...newExpense, splitType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equal">Equal Split</SelectItem>
                            <SelectItem value="exact">Exact Amounts</SelectItem>
                            <SelectItem value="percentage">By Percentage</SelectItem>
                            <SelectItem value="shares">By Shares</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Date</label>
                        <Input
                          type="date"
                          value={newExpense.date}
                          onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                        />
                      </div>

                      <Button variant="hero" className="w-full" onClick={handleAddExpense}>
                        Add Expense
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={isSettleOpen} onOpenChange={setIsSettleOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1 gap-2">
                      <Wallet className="w-4 h-4" />
                      Settle Up
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass border-border">
                    <DialogHeader>
                      <DialogTitle>Settle Up</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Who is paying?</label>
                        <Select
                          value={settleData.from}
                          onValueChange={(value) => setSettleData({ ...settleData, from: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select payer" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedGroup.members.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Who receives?</label>
                        <Select
                          value={settleData.to}
                          onValueChange={(value) => setSettleData({ ...settleData, to: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select receiver" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedGroup.members.filter(m => m.id !== settleData.from).map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Amount (₹)</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={settleData.amount}
                          onChange={(e) => setSettleData({ ...settleData, amount: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Payment Mode</label>
                        <Select
                          value={settleData.paymentMode}
                          onValueChange={(value: 'cash' | 'upi' | 'wallet') => setSettleData({ ...settleData, paymentMode: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">💵 Cash</SelectItem>
                            <SelectItem value="upi">📱 UPI</SelectItem>
                            <SelectItem value="wallet">💳 Wallet</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button variant="hero" className="w-full" onClick={handleSettle}>
                        Record Settlement
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Expense List */}
              {groupExpenses.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No expenses yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {groupExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((expense) => (
                    <Card key={expense.id} className="group hover:border-primary/30 transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
                            {CATEGORY_ICONS[expense.category as ExpenseCategory] || '📦'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{expense.description}</p>
                            <p className="text-sm text-muted-foreground">
                              Paid by {getMemberName(expense.paidBy[0].memberId)} · {new Date(expense.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">₹{expense.amount.toLocaleString()}</p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => {
                                deleteGroupExpense(expense.id);
                                toast.success('Expense deleted');
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Balances Tab */}
            <TabsContent value="balances" className="mt-4 space-y-4">
              <Card className="bg-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ArrowLeftRight className="w-4 h-4 text-primary" />
                    Simplified Settlements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {balances.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-2" />
                      <p className="text-muted-foreground">All settled up! 🎉</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {balances.map((balance, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{getMemberName(balance.from)}</span>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">{getMemberName(balance.to)}</span>
                          </div>
                          <span className="font-bold text-primary">₹{balance.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Member-wise breakdown */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Member Balances</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedGroup.members.map((member) => {
                      const balance = getMemberBalance(selectedGroup.id, member.id);
                      return (
                        <div key={member.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-foreground">{member.name}</span>
                          </div>
                          <span className={cn(
                            "font-bold",
                            balance > 0 ? "text-success" : balance < 0 ? "text-destructive" : "text-muted-foreground"
                          )}>
                            {balance > 0 ? '+' : ''}₹{Math.abs(balance).toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members" className="mt-4 space-y-4">
              <div className="space-y-3">
                {selectedGroup.members.map((member) => (
                  <Card key={member.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-medium text-primary">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{member.name}</p>
                          {member.email && <p className="text-sm text-muted-foreground">{member.email}</p>}
                        </div>
                      </div>
                      {member.id !== 'me' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            removeMemberFromGroup(selectedGroup.id, member.id);
                            toast.success(`${member.name} removed`);
                            // selectedGroup auto-updates from live groups
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button variant="outline" className="w-full gap-2" onClick={() => setIsAddMemberOpen(true)}>
                <UserPlus className="w-4 h-4" />
                Add Member
              </Button>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    );
  }

  // Groups List View
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-card border-b border-border/50 p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Split Expenses</h1>
            <p className="text-muted-foreground">Manage group expenses</p>
          </div>
          <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                New Group
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-border">
              <DialogHeader>
                <DialogTitle>Create Group</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Group Name</label>
                  <Input
                    placeholder="e.g., Goa Trip 2024"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Group Type</label>
                  <Select
                    value={newGroup.type}
                    onValueChange={(value: SplitGroup['type']) => setNewGroup({ ...newGroup, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(GROUP_TYPE_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          <span className="flex items-center gap-2">
                            <span>{GROUP_TYPE_ICONS[key as SplitGroup['type']]}</span>
                            {label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="hero" className="w-full" onClick={handleCreateGroup}>
                  Create Group
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {groups.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Users className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Groups Yet</h3>
            <p className="text-muted-foreground mb-6">Create a group to start splitting expenses</p>
            <Button variant="hero" onClick={() => setIsCreateGroupOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Group
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => {
              const balance = getMemberBalance(group.id, 'me');
              const totalSpend = getGroupTotalSpend(group.id);

              return (
                <Card
                  key={group.id}
                  className="cursor-pointer hover:border-primary/50 transition-all"
                  onClick={() => setSelectedGroupId(group.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">
                        {GROUP_TYPE_ICONS[group.type]}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground text-lg">{group.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {group.members.length} members · ₹{totalSpend.toLocaleString()} total
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "font-bold",
                          balance > 0 ? "text-success" : balance < 0 ? "text-destructive" : "text-muted-foreground"
                        )}>
                          {balance > 0 ? 'You get back' : balance < 0 ? 'You owe' : 'Settled'}
                        </p>
                        {balance !== 0 && (
                          <p className="font-semibold text-foreground">₹{Math.abs(balance).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
