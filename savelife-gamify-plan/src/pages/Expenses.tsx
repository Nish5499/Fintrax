import { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { ExpenseCategory, CATEGORY_COLORS, CATEGORY_LABELS, CATEGORY_ICONS } from '@/types/finance';

export default function Expenses() {
  const { expenses, addExpense, deleteExpense } = useFinance();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | 'all'>('all');
  
  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: 'food' as ExpenseCategory,
    description: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  
  const handleAddExpense = () => {
    if (!newExpense.amount || !newExpense.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    addExpense({
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      description: newExpense.description,
      date: newExpense.date,
      notes: newExpense.notes,
    });
    
    toast.success('Expense added successfully');
    setNewExpense({
      amount: '',
      category: 'food',
      description: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setIsDialogOpen(false);
  };
  
  const handleDeleteExpense = (id: string) => {
    deleteExpense(id);
    toast.success('Expense deleted');
  };
  
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const totalFiltered = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Group expenses by date
  const groupedExpenses = filteredExpenses.reduce((groups, expense) => {
    const date = expense.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(expense);
    return groups;
  }, {} as Record<string, typeof expenses>);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-card border-b border-border/50 p-6 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-border max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
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
                  <label className="text-sm text-muted-foreground mb-2 block">Description</label>
                  <Input
                    placeholder="What did you spend on?"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Date</label>
                  <Input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Notes (Optional)</label>
                  <Input
                    placeholder="Add any notes..."
                    value={newExpense.notes}
                    onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                  />
                </div>
                
                <Button variant="hero" className="w-full" onClick={handleAddExpense}>
                  Add Expense
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Search and Filter */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={filterCategory}
            onValueChange={(value) => setFilterCategory(value as ExpenseCategory | 'all')}
          >
            <SelectTrigger className="w-32">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>
      
      <main className="p-6 space-y-6">
        {/* Summary Card */}
        <Card className="gradient-primary border-0">
          <CardContent className="p-5">
            <p className="text-primary-foreground/70 text-sm">Total Expenses</p>
            <h2 className="text-3xl font-bold text-primary-foreground">
              ₹{totalFiltered.toLocaleString()}
            </h2>
            <p className="text-primary-foreground/70 text-sm mt-1">
              {filteredExpenses.length} transactions
            </p>
          </CardContent>
        </Card>
        
        {/* Expenses List */}
        <div className="space-y-6">
          {Object.entries(groupedExpenses).map(([date, dayExpenses]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </h3>
              <div className="space-y-3">
                {dayExpenses.map((expense) => (
                  <Card key={expense.id} className="hover:border-primary/30 transition-all group">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                          style={{ backgroundColor: `${CATEGORY_COLORS[expense.category]}20` }}
                        >
                          {CATEGORY_ICONS[expense.category]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{expense.description}</p>
                          <p className="text-sm text-muted-foreground">{CATEGORY_LABELS[expense.category]}</p>
                          {expense.notes && (
                            <p className="text-xs text-muted-foreground/70 mt-1">{expense.notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">-₹{expense.amount.toLocaleString()}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteExpense(expense.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
          
          {filteredExpenses.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No expenses found</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add your first expense
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
