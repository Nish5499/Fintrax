import { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, PiggyBank, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function SavingsGame() {
  const {
    savingsGame,
    completeSavingsCell,
    gameSavingsTotal,
    gameSavingsRemaining,
    savingsTarget,
    currentDay,
  } = useFinance();
  const [celebrating, setCelebrating] = useState(false);

  const savingsProgress = gameSavingsTotal;

  const progressPercentage = (savingsProgress / savingsTarget) * 100;
  const remaining = savingsTarget - savingsProgress;
  const isCompleted = savingsProgress >= savingsTarget;

  const handleCellClick = (cellId: number) => {
    const cell = savingsGame.find(c => c.id === cellId);
    if (!cell) return;

    if (cell.completed) {
      toast.info('This day is already completed!');
      return;
    }

    // ✅ Game is independent — no wallet check needed
    completeSavingsCell(cellId);

    const newProgress = savingsProgress + cell.value;
    if (newProgress >= savingsTarget) {
      setCelebrating(true);
      toast.success('🎉 Congratulations! You completed the 90-Day Challenge!');
      setTimeout(() => setCelebrating(false), 3000);
    } else {
      toast.success(`Day ${cellId} completed! Game saved ₹${cell.value} 🎮`);
    }
  };

  const getCellColor = (value: 100 | 200 | 500) => {
    switch (value) {
      case 100: return 'bg-primary/20 border-primary/40 hover:border-primary';
      case 200: return 'bg-info/20 border-info/40 hover:border-info';
      case 500: return 'bg-warning/20 border-warning/40 hover:border-warning';
    }
  };

  const getCellTextColor = (value: 100 | 200 | 500) => {
    switch (value) {
      case 100: return 'text-primary';
      case 200: return 'text-info';
      case 500: return 'text-warning';
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Celebration Overlay */}
      {celebrating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center animate-scale-in">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full gradient-primary flex items-center justify-center animate-pulse-slow">
              <Trophy className="w-16 h-16 text-primary-foreground" />
            </div>
            <h2 className="text-4xl font-bold text-gradient mb-4">Congratulations!</h2>
            <p className="text-xl text-muted-foreground">You saved ₹1,00,000 in 90 days!</p>
            <Button variant="hero" className="mt-8" onClick={() => setCelebrating(false)}>
              <Sparkles className="w-5 h-5 mr-2" />
              Celebrate!
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="gradient-card border-b border-border/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">90-Day Challenge</h1>
            <p className="text-muted-foreground">Save ₹1,00,000 in 90 days</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-warning" />
          </div>
        </div>

        {/* Progress Card */}
        <Card className="gradient-primary border-0 shadow-glow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-primary-foreground/70 text-sm">Total Saved</p>
                <h2 className="text-3xl font-bold text-primary-foreground">
                  ₹{savingsProgress.toLocaleString()}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-primary-foreground/70 text-sm">Remaining</p>
                <p className="text-xl font-semibold text-primary-foreground">
                  ₹{remaining.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-primary-foreground/70">
                <span>Progress</span>
                <span>{progressPercentage.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-primary-foreground/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-foreground rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </header>

      <main className="p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <Calendar className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Day</p>
              <p className="text-lg font-bold text-foreground">{currentDay}/90</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <PiggyBank className="w-5 h-5 text-warning mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Game Saved</p>
              <p className="text-lg font-bold text-foreground">₹{gameSavingsTotal.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <CheckCircle2 className="w-5 h-5 text-info mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-lg font-bold text-foreground">{savingsGame.filter(c => c.completed).length}</p>
            </CardContent>
          </Card>
        </div>
        {/* Clarification banner */}
        <div className="rounded-xl bg-warning/5 border border-warning/20 p-3">
          <p className="text-xs text-warning text-center">🎮 Game savings are tracked separately — they do not affect your wallet balance</p>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6">
          {[
            { value: 100, color: 'bg-primary', label: '₹100' },
            { value: 200, color: 'bg-info', label: '₹200' },
            { value: 500, color: 'bg-warning', label: '₹500' },
          ].map((item) => (
            <div key={item.value} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${item.color}`} />
              <span className="text-sm text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Game Board */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-center">Tap a cell to save that amount</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-9 gap-2">
              {savingsGame.map((cell) => (
                <button
                  key={cell.id}
                  onClick={() => handleCellClick(cell.id)}
                  disabled={cell.completed}
                  className={cn(
                    "aspect-square rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-200",
                    cell.completed
                      ? "bg-success/30 border-success/50 cursor-default"
                      : getCellColor(cell.value),
                    !cell.completed && "cursor-pointer hover:scale-105 active:scale-95"
                  )}
                >
                  {cell.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <>
                      <span className={cn("text-[10px] font-bold", getCellTextColor(cell.value))}>
                        ₹{cell.value}
                      </span>
                      <span className="text-[8px] text-muted-foreground">
                        D{cell.id}
                      </span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Game Rules */}
        <Card className="bg-muted/30">
          <CardContent className="p-5">
            <h4 className="font-semibold text-foreground mb-3">How to Play</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">1.</span>
                Tap any cell to mark that day's challenge as done
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">2.</span>
                Each cell tracks ₹100, ₹200, or ₹500 saved in the challenge
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">3.</span>
                Complete all 90 cells to reach the ₹1,00,000 goal!
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">4.</span>
                This is a separate game tracker — it does not affect your wallet
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
