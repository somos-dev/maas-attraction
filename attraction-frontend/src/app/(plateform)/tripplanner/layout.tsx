import AuthGuard from '@/guards/AuthGuard';
import { ReactNode } from 'react';

interface TripPlannerLayoutProps {
  children: ReactNode;
}

export default function TripPlannerLayout({ 
  children, 
}: TripPlannerLayoutProps) {
  return (
    <>
    <AuthGuard>
      {children}
    </AuthGuard>
    </>
  );
}