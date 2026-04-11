import { Outlet, Navigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import { useFinance } from '@/context/FinanceContext';

export default function AppLayout() {
  const { isAuthenticated, isAuthLoading } = useFinance();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div
      className="min-h-screen bg-background"
      style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}
    >
      <Outlet />
      <BottomNav />
    </div>
  );
}
