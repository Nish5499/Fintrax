import { useState, useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExpenseCategory, CATEGORY_COLORS, CATEGORY_LABELS, CATEGORY_ICONS } from '@/types/finance';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Wallet, Calendar,
  Flame, BarChart2, Activity,
} from 'lucide-react';
import { ChartTooltip } from '@/components/charts/ChartTooltip';
import { EmptyChart } from '@/components/charts/EmptyChart';

// ─── Types ─────────────────────────────────────────────────────────────────
type FilterKey = 'today' | 'week' | 'month' | 'year';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'year', label: 'This Year' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
function toDateStr(d: Date) {
  return d.toISOString().split('T')[0];
}

function filterStart(key: FilterKey): Date {
  const now = new Date();
  if (key === 'today') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (key === 'week') {
    const d = new Date(now);
    d.setDate(d.getDate() - 6);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (key === 'month') {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  // year
  return new Date(now.getFullYear(), 0, 1);
}

function filterDays(key: FilterKey): number {
  if (key === 'today') return 1;
  if (key === 'week') return 7;
  if (key === 'month') {
    const now = new Date();
    return now.getDate(); // days elapsed in month
  }
  // year
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return Math.max(1, Math.ceil((now.getTime() - start.getTime()) / 86400000));
}

// Custom pie label renderer showing percentage
const renderCustomLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent,
}: any) => {
  if (percent < 0.05) return null; // skip tiny slices
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
export default function Analytics() {
  const { expenses, walletBalance } = useFinance();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('month');

  // ── Filtered expenses ──
  const filteredExpenses = useMemo(() => {
    const start = filterStart(activeFilter);
    return expenses.filter(e => new Date(e.date) >= start);
  }, [expenses, activeFilter]);

  // ── Summary stats ──
  const totalSpent = useMemo(
    () => filteredExpenses.reduce((sum, e) => sum + e.amount, 0),
    [filteredExpenses],
  );
  const dailyAvg = totalSpent / filterDays(activeFilter);

  // ── Category breakdown ──
  const categoryTotals = useMemo(() => {
    return filteredExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<ExpenseCategory, number>);
  }, [filteredExpenses]);

  const pieData = useMemo(() =>
    Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        name: CATEGORY_LABELS[category as ExpenseCategory],
        value: amount,
        color: CATEGORY_COLORS[category as ExpenseCategory],
        icon: CATEGORY_ICONS[category as ExpenseCategory],
        category: category as ExpenseCategory,
        percent: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value),
    [categoryTotals, totalSpent],
  );

  const topCategory = pieData[0];

  // ── Highest single expense ──
  const highestExpense = useMemo(
    () =>
      filteredExpenses.length
        ? filteredExpenses.reduce((max, e) => (e.amount > max.amount ? e : max), filteredExpenses[0])
        : null,
    [filteredExpenses],
  );

  // ── Trend chart data (dynamic per filter) ──
  const trendData = useMemo(() => {
    if (activeFilter === 'today') {
      // Hourly buckets 00–23
      return Array.from({ length: 24 }, (_, h) => {
        const label = `${String(h).padStart(2, '0')}:00`;
        const today = toDateStr(new Date());
        const total = filteredExpenses
          .filter(e => e.date === today) // we don't store time, so distribute equally
          .reduce((s, e) => s + e.amount, 0);
        // Spread across hours — show aggregated on current hour
        const now = new Date().getHours();
        return { label, amount: h === now ? total : 0 };
      });
    }

    if (activeFilter === 'week') {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = toDateStr(d);
        const total = filteredExpenses
          .filter(e => e.date === dateStr)
          .reduce((s, e) => s + e.amount, 0);
        return {
          label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
          amount: total,
        };
      });
    }

    if (activeFilter === 'month') {
      const now = new Date();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      return Array.from({ length: daysInMonth }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth(), i + 1);
        const dateStr = toDateStr(d);
        const total = filteredExpenses
          .filter(e => e.date === dateStr)
          .reduce((s, e) => s + e.amount, 0);
        return { label: String(i + 1), amount: total };
      });
    }

    // year — monthly
    return Array.from({ length: 12 }, (_, m) => {
      const now = new Date();
      const total = filteredExpenses
        .filter(e => {
          const d = new Date(e.date);
          return d.getFullYear() === now.getFullYear() && d.getMonth() === m;
        })
        .reduce((s, e) => s + e.amount, 0);
      return {
        label: new Date(now.getFullYear(), m, 1).toLocaleDateString('en-IN', { month: 'short' }),
        amount: total,
      };
    });
  }, [filteredExpenses, activeFilter]);

  // ── Last 6 months comparison (always shown) ──
  const monthlyComparison = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const yr = d.getFullYear();
      const mo = d.getMonth();
      const total = expenses
        .filter(e => {
          const ed = new Date(e.date);
          return ed.getFullYear() === yr && ed.getMonth() === mo;
        })
        .reduce((s, e) => s + e.amount, 0);
      return {
        month: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        amount: total,
      };
    });
  }, [expenses]);

  const isEmpty = filteredExpenses.length === 0;

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="gradient-card border-b border-border/50 p-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        </div>
        <p className="text-muted-foreground text-sm">Deep dive into your financial behaviour</p>

        {/* Time filters */}
        <div className="flex gap-2 mt-5 overflow-x-auto pb-1">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`
                flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                ${activeFilter === f.key
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'}
              `}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <main className="p-4 space-y-5 pb-24">

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-3 gap-3">
          {/* Total Spent */}
          <Card className="col-span-1 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-3">
              <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center mb-2">
                <TrendingDown className="w-4 h-4 text-primary" />
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">Total Spent</p>
              <p className="text-base font-bold text-foreground mt-0.5">
                ₹{totalSpent.toLocaleString('en-IN')}
              </p>
            </CardContent>
          </Card>

          {/* Balance */}
          <Card className="col-span-1 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="p-3">
              <div className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center mb-2">
                <Wallet className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">Balance</p>
              <p className={`text-base font-bold mt-0.5 ${walletBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ₹{Math.abs(walletBalance).toLocaleString('en-IN')}
              </p>
            </CardContent>
          </Card>

          {/* Daily Avg */}
          <Card className="col-span-1 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="p-3">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center mb-2">
                <Calendar className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">Daily Avg</p>
              <p className="text-base font-bold text-foreground mt-0.5">
                ₹{Math.round(dailyAvg).toLocaleString('en-IN')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ── Highest Spending Insight ── */}
        {isEmpty ? (
          <Card className="border-dashed border-border/40">
            <CardContent className="p-5 flex flex-col items-center gap-2">
              <span className="text-4xl opacity-30">💸</span>
              <p className="text-sm text-muted-foreground text-center">
                No expenses recorded for this period
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {/* Highest Category */}
            {topCategory && (
              <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-orange-500/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <p className="text-xs text-muted-foreground">Top Category</p>
                  </div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2"
                    style={{ backgroundColor: `${topCategory.color}25` }}
                  >
                    {topCategory.icon}
                  </div>
                  <p className="text-sm font-bold text-foreground">{topCategory.name}</p>
                  <p className="text-xs text-orange-400 font-medium mt-0.5">
                    ₹{topCategory.value.toLocaleString('en-IN')}
                    <span className="text-muted-foreground ml-1">({topCategory.percent.toFixed(0)}%)</span>
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Highest Single Expense */}
            {highestExpense && (
              <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-purple-500/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <p className="text-xs text-muted-foreground">Biggest Spend</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-xl mb-2">
                    {CATEGORY_ICONS[highestExpense.category]}
                  </div>
                  <p className="text-sm font-bold text-foreground line-clamp-1">{highestExpense.description}</p>
                  <p className="text-xs text-purple-400 font-medium mt-0.5">
                    ₹{highestExpense.amount.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(highestExpense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ── Category Breakdown (enhanced donut) ── */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {isEmpty || pieData.length === 0 ? (
              <EmptyChart message="No category data for this period" />
            ) : (
              <>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        strokeWidth={0}
                        labelLine={false}
                        label={renderCustomLabel}
                        isAnimationActive
                        animationBegin={0}
                        animationDuration={800}
                        animationEasing="ease-out"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) =>
                          active && payload?.length ? (
                            <div className="rounded-xl border border-white/10 bg-background/90 backdrop-blur-md px-4 py-3 shadow-2xl">
                              <p className="text-xs text-muted-foreground">{payload[0].name}</p>
                              <p className="text-base font-bold text-foreground">
                                ₹{Number(payload[0].value).toLocaleString('en-IN')}
                              </p>
                              <p className="text-xs text-primary">
                                {((Number(payload[0].value) / totalSpent) * 100).toFixed(1)}% of total
                              </p>
                            </div>
                          ) : null
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="space-y-2 mt-2">
                  {pieData.map((item) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-sm">{item.icon}</span>
                        <span className="text-sm text-foreground">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{item.percent.toFixed(1)}%</span>
                        <span className="text-sm font-semibold text-foreground w-24 text-right">
                          ₹{item.value.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* ── Spending Trend ── */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Spending Trend —&nbsp;
              <span className="text-muted-foreground font-normal">
                {FILTERS.find(f => f.key === activeFilter)?.label}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {isEmpty ? (
              <EmptyChart message="No spending data to display" height="h-44" />
            ) : (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  {activeFilter === 'week' || activeFilter === 'year' ? (
                    <BarChart data={trendData} barSize={activeFilter === 'year' ? 18 : 28}>
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                        tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`}
                        width={45}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar
                        dataKey="amount"
                        fill="url(#barGrad)"
                        radius={[6, 6, 0, 0]}
                        isAnimationActive
                        animationBegin={0}
                        animationDuration={700}
                        animationEasing="ease-out"
                      />
                    </BarChart>
                  ) : (
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                        interval={activeFilter === 'month' ? 4 : 2}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                        tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`}
                        width={45}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fill="url(#areaGrad)"
                        dot={false}
                        isAnimationActive
                        animationBegin={0}
                        animationDuration={800}
                        animationEasing="ease-out"
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Monthly Comparison (always shown) ── */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" />
              Monthly Comparison
              <span className="text-xs text-muted-foreground font-normal ml-1">(Last 6 months)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {expenses.length === 0 ? (
              <EmptyChart message="No monthly data available" height="h-44" />
            ) : (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyComparison} barSize={22}>
                    <defs>
                      <linearGradient id="monthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.5} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                      tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`}
                      width={45}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar
                      dataKey="amount"
                      fill="url(#monthGrad)"
                      radius={[6, 6, 0, 0]}
                      isAnimationActive
                      animationBegin={150}
                      animationDuration={700}
                      animationEasing="ease-out"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
