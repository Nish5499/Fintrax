import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, BarChart3, PiggyBank, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/expenses', icon: Receipt, label: 'Expenses' },
  { to: '/splitwise', icon: Users, label: 'Split' },
  { to: '/analytics', icon: BarChart3, label: 'Charts' },
  { to: '/savings', icon: PiggyBank, label: 'Savings' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around px-1 py-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl transition-all duration-200 min-w-0 flex-1",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "animate-scale-in")} />
              <span className="text-[10px] font-medium leading-none mt-0.5 truncate w-full text-center">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
