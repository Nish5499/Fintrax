import { Outlet, Navigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import { useFinance } from '@/context/FinanceContext';

export default function AppLayout() {
  const { isAuthenticated } = useFinance();

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
