import { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, Sparkles, Calendar, TrendingUp, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { FinancialGoal } from '@/types/finance';

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal } = useFinance();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [aiStep, setAiStep] = useState(0);
  
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
    monthlySalary: '',
    fixedExpenses: '',
    variableExpenses: '',
  });
  
  const [aiGoal, setAiGoal] = useState<Partial<FinancialGoal> | null>(null);
  
  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.deadline) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    addGoal({
      name: newGoal.name,
      targetAmount: parseFloat(newGoal.targetAmount),
      deadline: newGoal.deadline,
      monthlySalary: newGoal.monthlySalary ? parseFloat(newGoal.monthlySalary) : undefined,
      fixedExpenses: newGoal.fixedExpenses ? parseFloat(newGoal.fixedExpenses) : undefined,
      variableExpenses: newGoal.variableExpenses ? parseFloat(newGoal.variableExpenses) : undefined,
    });
    
    toast.success('Goal created successfully!');
    setNewGoal({
      name: '',
      targetAmount: '',
      deadline: '',
      monthlySalary: '',
      fixedExpenses: '',
      variableExpenses: '',
    });
    setIsDialogOpen(false);
  };
  
  const calculateAIPlan = () => {
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.deadline || !newGoal.monthlySalary) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const target = parseFloat(newGoal.targetAmount);
    const salary = parseFloat(newGoal.monthlySalary);
    const fixed = parseFloat(newGoal.fixedExpenses || '0');
    const variable = parseFloat(newGoal.variableExpenses || '0');
    
    const deadline = new Date(newGoal.deadline);
    const today = new Date();
    const monthsRemaining = Math.max(1, Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    
    const availableMonthly = salary - fixed - variable;
    const monthlySavingTarget = Math.ceil(target / monthsRemaining);
    const dailySavingTarget = Math.ceil(monthlySavingTarget / 30);
    
    setAiGoal({
      name: newGoal.name,
      targetAmount: target,
      deadline: newGoal.deadline,
      monthlySalary: salary,
      fixedExpenses: fixed,
      variableExpenses: variable,
      monthlySavingTarget,
      dailySavingTarget,
    });
    
    setAiStep(2);
  };
  
  const handleAIGoalCreate = () => {
    if (aiGoal) {
      addGoal({
        name: aiGoal.name!,
        targetAmount: aiGoal.targetAmount!,
        deadline: aiGoal.deadline!,
        monthlySalary: aiGoal.monthlySalary,
        fixedExpenses: aiGoal.fixedExpenses,
        variableExpenses: aiGoal.variableExpenses,
        monthlySavingTarget: aiGoal.monthlySavingTarget,
        dailySavingTarget: aiGoal.dailySavingTarget,
      });
      
      toast.success('AI-powered goal created!');
      setIsAIDialogOpen(false);
      setAiStep(0);
      setAiGoal(null);
      setNewGoal({
        name: '',
        targetAmount: '',
        deadline: '',
        monthlySalary: '',
        fixedExpenses: '',
        variableExpenses: '',
      });
    }
  };
  
  const handleAddProgress = (goalId: string, amount: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      const newAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
      updateGoal(goalId, { 
        currentAmount: newAmount,
        status: newAmount >= goal.targetAmount ? 'completed' : 'active'
      });
      toast.success(`Added ₹${amount.toLocaleString()} to ${goal.name}`);
    }
  };
  
  const handleDeleteGoal = (id: string) => {
    deleteGoal(id);
    toast.success('Goal deleted');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-card border-b border-border/50 p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Financial Goals</h1>
            <p className="text-muted-foreground">Plan and track your goals</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="hero" size="sm" className="gap-2" onClick={() => setAiStep(0)}>
                  <Sparkles className="w-4 h-4" />
                  AI Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="glass border-border max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    AI Goal Setter
                  </DialogTitle>
                </DialogHeader>
                
                {aiStep === 0 && (
                  <div className="space-y-4 pt-4">
                    <p className="text-muted-foreground text-sm">
                      I'll help you create a personalized savings plan. Let's start with some questions.
                    </p>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">What's your goal?</label>
                      <Input
                        placeholder="e.g., Buy a car, Goa trip, Emergency fund"
                        value={newGoal.name}
                        onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Target Amount (₹)</label>
                      <Input
                        type="number"
                        placeholder="e.g., 500000"
                        value={newGoal.targetAmount}
                        onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Target Date</label>
                      <Input
                        type="date"
                        value={newGoal.deadline}
                        onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                      />
                    </div>
                    <Button variant="hero" className="w-full" onClick={() => setAiStep(1)}>
                      Continue
                    </Button>
                  </div>
                )}
                
                {aiStep === 1 && (
                  <div className="space-y-4 pt-4">
                    <p className="text-muted-foreground text-sm">
                      Great! Now tell me about your income and expenses.
                    </p>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Monthly Salary (₹)</label>
                      <Input
                        type="number"
                        placeholder="e.g., 50000"
                        value={newGoal.monthlySalary}
                        onChange={(e) => setNewGoal({ ...newGoal, monthlySalary: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Fixed Expenses (₹) - Rent, EMIs, etc.</label>
                      <Input
                        type="number"
                        placeholder="e.g., 20000"
                        value={newGoal.fixedExpenses}
                        onChange={(e) => setNewGoal({ ...newGoal, fixedExpenses: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Variable Expenses (₹) - Food, shopping, etc.</label>
                      <Input
                        type="number"
                        placeholder="e.g., 15000"
                        value={newGoal.variableExpenses}
                        onChange={(e) => setNewGoal({ ...newGoal, variableExpenses: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={() => setAiStep(0)}>
                        Back
                      </Button>
                      <Button variant="hero" className="flex-1" onClick={calculateAIPlan}>
                        Calculate Plan
                      </Button>
                    </div>
                  </div>
                )}
                
                {aiStep === 2 && aiGoal && (
                  <div className="space-y-4 pt-4">
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        Your Personalized Plan
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Goal</span>
                          <span className="font-medium text-foreground">{aiGoal.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Target Amount</span>
                          <span className="font-medium text-foreground">₹{aiGoal.targetAmount?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Monthly Saving Target</span>
                          <span className="font-medium text-primary">₹{aiGoal.monthlySavingTarget?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Daily Saving Target</span>
                          <span className="font-medium text-primary">₹{aiGoal.dailySavingTarget?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    {aiGoal.monthlySavingTarget! > (aiGoal.monthlySalary! - aiGoal.fixedExpenses! - aiGoal.variableExpenses!) && (
                      <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground text-sm">Heads up!</p>
                            <p className="text-muted-foreground text-sm mt-1">
                              This goal requires more savings than your available budget. Consider:
                            </p>
                            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                              <li>• Reducing variable expenses</li>
                              <li>• Extending your deadline</li>
                              <li>• Finding additional income sources</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1" onClick={() => setAiStep(1)}>
                        Adjust
                      </Button>
                      <Button variant="hero" className="flex-1" onClick={handleAIGoalCreate}>
                        Create Goal
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="glass border-border">
                <DialogHeader>
                  <DialogTitle>Add New Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Goal Name</label>
                    <Input
                      placeholder="e.g., Emergency Fund"
                      value={newGoal.name}
                      onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Target Amount (₹)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={newGoal.targetAmount}
                      onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Target Date</label>
                    <Input
                      type="date"
                      value={newGoal.deadline}
                      onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                    />
                  </div>
                  <Button variant="hero" className="w-full" onClick={handleAddGoal}>
                    Create Goal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>
      
      <main className="p-6 space-y-6">
        {goals.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Target className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Goals Yet</h3>
            <p className="text-muted-foreground mb-6">Create your first financial goal to start tracking</p>
            <div className="flex justify-center gap-3">
              <Button variant="hero" onClick={() => setIsAIDialogOpen(true)}>
                <Sparkles className="w-4 h-4 mr-2" />
                AI Goal Setter
              </Button>
              <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Quick Add
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              const daysRemaining = Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
              
              return (
                <Card key={goal.id} className="overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          goal.status === 'completed' ? 'bg-success/10' : 'bg-primary/10'
                        }`}>
                          {goal.status === 'completed' ? (
                            <CheckCircle2 className="w-6 h-6 text-success" />
                          ) : (
                            <Target className="w-6 h-6 text-primary" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{goal.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {daysRemaining} days left
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDeleteGoal(goal.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium text-foreground">
                          ₹{goal.currentAmount.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-3 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            goal.status === 'completed' ? 'bg-success' : 'gradient-primary'
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">{progress.toFixed(1)}% complete</p>
                    </div>
                    
                    {goal.monthlySavingTarget && goal.status !== 'completed' && (
                      <div className="mt-4 p-3 rounded-lg bg-muted/50 flex items-center gap-3">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <div className="text-sm">
                          <span className="text-muted-foreground">Save </span>
                          <span className="font-medium text-primary">₹{goal.monthlySavingTarget.toLocaleString()}/month</span>
                          <span className="text-muted-foreground"> or </span>
                          <span className="font-medium text-primary">₹{goal.dailySavingTarget?.toLocaleString()}/day</span>
                        </div>
                      </div>
                    )}
                    
                    {goal.status !== 'completed' && (
                      <div className="flex gap-2 mt-4">
                        {[500, 1000, 2000].map((amount) => (
                          <Button
                            key={amount}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleAddProgress(goal.id, amount)}
                          >
                            +₹{amount}
                          </Button>
                        ))}
                      </div>
                    )}
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
