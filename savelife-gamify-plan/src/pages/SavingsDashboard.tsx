import { useFinance } from '@/context/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
    PiggyBank, Gamepad2, Target, TrendingUp, Trophy,
    ChevronRight, ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

// Generate last-3-months label + mock savings data derived from real expenses
function getLast3MonthsSavings(
    totalMoneyAdded: number,
    expenses: { amount: number; date: string }[]
) {
    const result = [];
    for (let i = 2; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const label = d.toLocaleString('default', { month: 'short' });
        const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const spent = expenses
            .filter(e => e.date.startsWith(monthStr))
            .reduce((s, e) => s + e.amount, 0);

        // Rough: allocate addedAmount evenly across 3 months for past months, or use actual for current
        const isCurrentMonth = i === 0;
        const allocated = isCurrentMonth ? totalMoneyAdded : totalMoneyAdded * 0.85; // approximate
        const savings = Math.max(0, allocated - spent);
        result.push({ month: label, savings, spent });
    }
    return result;
}

export default function SavingsDashboard() {
    const {
        walletBalance, totalMoneyAdded, expenses,
        gameSavingsTotal, gameSavingsRemaining, savingsTarget, currentDay,
        goals,
        monthlyExpensesTotal,
    } = useFinance();

    const activeGoals = goals.filter(g => g.status === 'active');
    const completedGoals = goals.filter(g => g.status === 'completed');
    const gameProgressPct = Math.min((gameSavingsTotal / savingsTarget) * 100, 100);
    const monthlySavings = Math.max(0, walletBalance); // remaining balance = savings

    const monthlyData = getLast3MonthsSavings(totalMoneyAdded, expenses);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="gradient-card border-b border-border/50 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <PiggyBank className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Savings Dashboard</h1>
                        <p className="text-muted-foreground text-sm">Your complete savings overview</p>
                    </div>
                </div>

                {/* Main savings card */}
                <Card className="gradient-primary border-0 shadow-glow">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-primary-foreground/70 text-sm mb-1">Total Savings</p>
                                <h2 className="text-4xl font-bold text-primary-foreground">
                                    ₹{walletBalance.toLocaleString()}
                                </h2>
                                <p className="text-primary-foreground/60 text-xs mt-1">
                                    Wallet balance (money remaining)
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                                <PiggyBank className="w-6 h-6 text-primary-foreground" />
                            </div>
                        </div>
                        <div className="flex gap-4 mt-5">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                                    <ArrowUpRight className="w-3 h-3 text-primary-foreground" />
                                </div>
                                <div>
                                    <p className="text-xs text-primary-foreground/70">Total Added</p>
                                    <p className="text-sm font-semibold text-primary-foreground">₹{totalMoneyAdded.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                                    <TrendingUp className="w-3 h-3 text-primary-foreground" />
                                </div>
                                <div>
                                    <p className="text-xs text-primary-foreground/70">This Month</p>
                                    <p className="text-sm font-semibold text-primary-foreground">-₹{monthlyExpensesTotal.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </header>

            <main className="p-6 space-y-6">
                {/* Game Challenge Savings — separate system */}
                <section>
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
                                            <p className="text-xs text-muted-foreground">Independent game system · Day {currentDay}/90</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                </div>

                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    <div className="rounded-xl bg-muted/50 p-3 text-center">
                                        <p className="text-xs text-muted-foreground mb-1">Saved in Game</p>
                                        <p className="text-base font-bold text-warning">₹{gameSavingsTotal.toLocaleString()}</p>
                                    </div>
                                    <div className="rounded-xl bg-muted/50 p-3 text-center">
                                        <p className="text-xs text-muted-foreground mb-1">Remaining</p>
                                        <p className="text-base font-bold text-foreground">₹{gameSavingsRemaining.toLocaleString()}</p>
                                    </div>
                                    <div className="rounded-xl bg-muted/50 p-3 text-center">
                                        <p className="text-xs text-muted-foreground mb-1">Progress</p>
                                        <p className="text-base font-bold text-primary">{gameProgressPct.toFixed(1)}%</p>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Challenge Target</span>
                                        <span>₹{savingsTarget.toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full gradient-primary rounded-full transition-all duration-500"
                                            style={{ width: `${gameProgressPct}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="mt-3 p-2 rounded-lg bg-warning/5 border border-warning/20">
                                    <p className="text-xs text-warning text-center">
                                        🎮 Game savings are independent from your wallet balance
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </section>

                {/* Monthly Savings Summary */}
                <section>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Savings (Last 3 Months)</h3>
                    <Card>
                        <CardContent className="p-5">
                            <div className="h-40">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyData} barCategoryGap="30%">
                                        <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <YAxis hide />
                                        <Tooltip
                                            formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Savings']}
                                            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                                        />
                                        <Bar dataKey="savings" radius={[6, 6, 0, 0]}>
                                            {monthlyData.map((entry, index) => (
                                                <Cell
                                                    key={index}
                                                    fill={index === monthlyData.length - 1 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground) / 0.3)'}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-3 flex items-center justify-between text-sm border-t border-border/40 pt-3">
                                <span className="text-muted-foreground">This month spent</span>
                                <span className="font-semibold text-foreground">₹{monthlyExpensesTotal.toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Savings Goals */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-foreground">Savings Goals</h3>
                        <Link to="/goals" className="text-sm text-primary font-medium flex items-center gap-1">
                            Manage <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Summary chips */}
                    <div className="flex gap-3 mb-4">
                        <div className="flex-1 rounded-xl bg-primary/10 p-3 text-center">
                            <Target className="w-5 h-5 text-primary mx-auto mb-1" />
                            <p className="text-xs text-muted-foreground">Active Goals</p>
                            <p className="text-xl font-bold text-primary">{activeGoals.length}</p>
                        </div>
                        <div className="flex-1 rounded-xl bg-success/10 p-3 text-center">
                            <Trophy className="w-5 h-5 text-success mx-auto mb-1" />
                            <p className="text-xs text-muted-foreground">Completed</p>
                            <p className="text-xl font-bold text-success">{completedGoals.length}</p>
                        </div>
                    </div>

                    {activeGoals.length > 0 ? (
                        <div className="space-y-3">
                            {activeGoals.slice(0, 3).map((goal) => {
                                const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                                return (
                                    <Card key={goal.id}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="font-medium text-foreground text-sm">{goal.name}</p>
                                                <span className="text-xs text-muted-foreground">{pct.toFixed(0)}%</span>
                                            </div>
                                            <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
                                                <div
                                                    className="h-full gradient-primary rounded-full transition-all duration-500"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>₹{goal.currentAmount.toLocaleString()} saved</span>
                                                <span>₹{goal.targetAmount.toLocaleString()} target</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <Card className="bg-muted/30">
                            <CardContent className="p-6 text-center">
                                <Target className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground mb-3">No active savings goals yet</p>
                                <Link to="/goals">
                                    <Button variant="outline" size="sm">Create a Goal</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </section>
            </main>
        </div>
    );
}
