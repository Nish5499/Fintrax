import { useFinance } from '@/context/FinanceContext';
import { useSplit } from '@/context/SplitContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Wallet, Plus, TrendingUp, Receipt, Gamepad2, Target,
  ChevronRight, ArrowUpRight, ArrowDownRight, LogOut,
  PiggyBank, Users, TrendingDown
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { CATEGORY_COLORS, CATEGORY_LABELS, ExpenseCategory } from '@/types/finance';

const MY_ID = 'me';

export default function Dashboard() {
  const {
    user, logout, walletBalance, totalMoneyAdded,
    expenses, addToWallet,
    gameSavingsTotal, savingsTarget, currentDay,
    monthlyExpensesTotal,
  } = useFinance();
  const { getMyTotalOwed, getMyTotalOwedToMe, getMyDebtSummary } = useSplit();

  const navigate = useNavigate();
  const [addAmount, setAddAmount] = useState('');
  const [addDesc, setAddDesc] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddMoney = () => {
    const amount = parseFloat(addAmount);
    if (amount > 0) {
      addToWallet(amount, addDesc.trim() || 'Manual deposit');
      toast.success(`₹${amount.toLocaleString()} added to wallet`);
      setAddAmount('');
      setAddDesc('');
      setIsDialogOpen(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  // Chart data
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<ExpenseCategory, number>);

  const chartData = Object.entries(categoryTotals).map(([category, amount]) => ({
    name: CATEGORY_LABELS[category as ExpenseCategory],
    value: amount,
    color: CATEGORY_COLORS[category as ExpenseCategory],
  }));

  // Stats
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const savingsAmount = walletBalance; // remaining balance IS the savings
  const gameProgressPct = Math.min((gameSavingsTotal / savingsTarget) * 100, 100);

  // Split summary (cross-group)
  const myTotalOwed = getMyTotalOwed(MY_ID);
  const myTotalOwedToMe = getMyTotalOwedToMe(MY_ID);
  const debtSummary = getMyDebtSummary(MY_ID).slice(0, 3);

  const quickActions = [
    { icon: Plus, label: 'Add Expense', to: '/expenses', color: 'text-primary', bg: 'bg-primary/10' },
    { icon: Wallet, label: 'Add Money', action: () => setIsDialogOpen(true), color: 'text-success', bg: 'bg-success/10' },
    { icon: PiggyBank, label: 'Savings', to: '/savings', color: 'text-info', bg: 'bg-info/10' },
    { icon: Users, label: 'Split', to: '/splitwise', color: 'text-warning', bg: 'bg-warning/10' },
  ];

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-card border-b border-border/50 p-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-muted-foreground text-sm">Welcome back,</p>
            <h1 className="text-xl font-semibold text-foreground">{user?.name || 'User'}</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        {/* Wallet Card */}
        <Card className="gradient-primary border-0 shadow-glow overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-primary-foreground/70 text-sm mb-1">Wallet Balance</p>
                <h2 className="text-4xl font-bold text-primary-foreground">
                  ₹{walletBalance.toLocaleString()}
                </h2>
                <p className="text-primary-foreground/60 text-xs mt-1">
                  ₹{totalMoneyAdded.toLocaleString()} added — ₹{totalExpenses.toLocaleString()} spent
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>

            {/* Monthly chips */}
            <div className="flex gap-4 mt-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                  <ArrowDownRight className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-xs text-primary-foreground/70">This Month</p>
                  <p className="text-sm font-semibold text-primary-foreground">
                    -₹{monthlyExpensesTotal.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-xs text-primary-foreground/70">Savings</p>
                  <p className="text-sm font-semibold text-primary-foreground">
                    ₹{savingsAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </header>

      <main className="p-6 space-y-6">
        {/* Quick Actions */}
        <section>
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action, i) => (
              action.to ? (
                <Link key={i} to={action.to}>
                  <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-all">
                    <div className={`w-12 h-12 rounded-xl ${action.bg} flex items-center justify-center`}>
                      <action.icon className={`w-6 h-6 ${action.color}`} />
                    </div>
                    <span className="text-xs text-muted-foreground text-center">{action.label}</span>
                  </div>
                </Link>
              ) : (
                <button key={i} onClick={action.action} className="w-full">
                  <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-all">
                    <div className={`w-12 h-12 rounded-xl ${action.bg} flex items-center justify-center`}>
                      <action.icon className={`w-6 h-6 ${action.color}`} />
                    </div>
                    <span className="text-xs text-muted-foreground text-center">{action.label}</span>
                  </div>
                </button>
              )
            ))}
          </div>
        </section>

        {/* Split Summary */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Split Summary</h3>
            <Link to="/splitwise" className="text-sm text-primary font-medium flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <Card>
            <CardContent className="p-5">
              {/* Totals row */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1 rounded-xl bg-destructive/10 p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">You Owe</p>
                  <p className="text-lg font-bold text-destructive">₹{myTotalOwed.toLocaleString()}</p>
                </div>
                <div className="flex-1 rounded-xl bg-success/10 p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">You Are Owed</p>
                  <p className="text-lg font-bold text-success">₹{myTotalOwedToMe.toLocaleString()}</p>
                </div>
              </div>

              {/* Per-person quick insights */}
              {debtSummary.length > 0 && (
                <div className="space-y-2">
                  {debtSummary.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-t border-border/40">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${item.direction === 'owedBy' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                          }`}>
                          {item.name[0]}
                        </div>
                        <span className="text-sm text-foreground">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {item.direction === 'owedBy' ? (
                          <TrendingUp className="w-3 h-3 text-success" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-destructive" />
                        )}
                        <span className={`text-sm font-semibold ${item.direction === 'owedBy' ? 'text-success' : 'text-destructive'}`}>
                          {item.direction === 'owedBy' ? 'owes you' : 'you owe'} ₹{item.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {debtSummary.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">All settled up! 🎉</p>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Savings Game Progress */}
        <Link to="/savings-game">
          <Card className="hover:border-primary/50 transition-all cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">90-Day Game Challenge</h4>
                    <p className="text-sm text-muted-foreground">Day {currentDay} / 90 · Game savings only</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Saved in Game</span>
                  <span className="text-foreground font-medium">₹{gameSavingsTotal.toLocaleString()} / ₹{savingsTarget.toLocaleString()}</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full gradient-primary rounded-full transition-all duration-500"
                    style={{ width: `${gameProgressPct}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Spending Overview */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Spending Overview</h3>
            <Link to="/analytics" className="text-sm text-primary font-medium flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} dataKey="value" cx="50%" cy="50%" innerRadius={25} outerRadius={40} paddingAngle={2}>
                        {chartData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  {chartData.slice(0, 4).map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-muted-foreground truncate">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Recent Expenses */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Recent Expenses</h3>
            <Link to="/expenses" className="text-sm text-primary font-medium flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentExpenses.map((expense) => (
              <Card key={expense.id} className="hover:border-border/80 transition-all">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${CATEGORY_COLORS[expense.category]}20` }}
                    >
                      {expense.category === 'food' && '🍔'}
                      {expense.category === 'travel' && '✈️'}
                      {expense.category === 'rent' && '🏠'}
                      {expense.category === 'shopping' && '🛍️'}
                      {expense.category === 'bills' && '📄'}
                      {expense.category === 'others' && '📦'}
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{expense.description}</p>
                      <p className="text-xs text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-foreground">-₹{expense.amount.toLocaleString()}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Add Money Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass border-border">
          <DialogHeader>
            <DialogTitle>Add Money to Wallet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              type="number"
              placeholder="Enter amount"
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
              className="text-lg"
            />
            <Input
              type="text"
              placeholder="Description (optional)"
              value={addDesc}
              onChange={(e) => setAddDesc(e.target.value)}
            />
            <div className="flex gap-2">
              {[500, 1000, 2000, 5000].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setAddAmount(amount.toString())}
                  className="flex-1"
                >
                  ₹{amount}
                </Button>
              ))}
            </div>
            <Button variant="hero" className="w-full" onClick={handleAddMoney}>
              Add Money
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
