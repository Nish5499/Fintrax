import { Outlet, Navigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import { useFinance } from '@/context/FinanceContext';

export default function AppLayout() {
  const { isAuthenticated } = useFinance();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <div className="min-h-screen bg-background pb-24">
      <Outlet />
      <BottomNav />
    </div>
  );
}
