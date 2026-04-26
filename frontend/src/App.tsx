import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardSkeleton } from '@/components/shared/SkeletonLoader';

const Landing = lazy(() => import('@/pages/Landing'));
const Auth = lazy(() => import('@/pages/Auth'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Log = lazy(() => import('@/pages/Log'));
const Calendar = lazy(() => import('@/pages/Calendar'));
const Insights = lazy(() => import('@/pages/Insights'));
const PCOD = lazy(() => import('@/pages/PCOD'));
const Profile = lazy(() => import('@/pages/Profile'));
const Exercise = lazy(() => import('@/pages/Exercise'));
const History = lazy(() => import('@/pages/History'));
const PartnerPortal = lazy(() => import('@/pages/PartnerPortal'));
const DoctorPortal = lazy(() => import('@/pages/DoctorPortal'));
const PartnerDashboard = lazy(() => import('@/pages/PartnerDashboard'));
const DoctorRegister = lazy(() => import('@/pages/DoctorRegister'));
const DoctorLayout = lazy(() => import('@/components/layout/DoctorLayout'));
const DoctorOverview = lazy(() => import('@/pages/doctor/DoctorOverview'));
const DoctorQueries = lazy(() => import('@/pages/doctor/DoctorQueries'));
const DoctorNotifications = lazy(() => import('@/pages/doctor/DoctorNotifications'));
const DoctorProfile = lazy(() => import('@/pages/doctor/DoctorProfile'));
const QueryThread = lazy(() => import('@/pages/QueryThread'));
const Community = lazy(() => import('@/pages/Community'));
const AskQuestion = lazy(() => import('@/pages/AskQuestion'));
const BrowseDoctors = lazy(() => import('@/pages/BrowseDoctors'));
const DoctorPublicProfile = lazy(() => import('@/pages/DoctorPublicProfile'));
const UserNotifications = lazy(() => import('@/pages/UserNotifications'));

import { seedDoctors } from '@/lib/seedDoctors';
import { useUserType } from '@/hooks/useUserType';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1 },
  },
});

import femtrackDB from '@/lib/db';
import { useState, useEffect } from 'react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      femtrackDB.profiles.where('odataId').equals(user.uid).first().then(p => {
        setRole(p?.role || 'user');
      });
    }
  }, [user]);

  if (loading) return <div className="min-h-screen bg-plum flex items-center justify-center"><DashboardSkeleton /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function DoctorProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { userType, loading: typeLoading } = useUserType();

  if (authLoading || typeLoading) return <div className="min-h-screen bg-plum flex items-center justify-center"><DashboardSkeleton /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (userType !== 'doctor') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      femtrackDB.profiles.where('odataId').equals(user.uid).first().then(p => {
        setTarget(p?.role === 'partner' ? '/partner-dashboard' : '/dashboard');
      });
    }
  }, [user]);

  if (loading) return <div className="min-h-screen bg-plum flex items-center justify-center"><DashboardSkeleton /></div>;
  if (user && target) return <Navigate to={target} replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-plum flex items-center justify-center p-8"><DashboardSkeleton /></div>}>
      <Routes>
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />

        {/* Public portals (no auth required) */}
        <Route path="/partner/:token" element={<PartnerPortal />} />
        <Route path="/doctor" element={<DoctorPortal />} />

        {/* Protected app routes */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/log" element={<Log />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/pcod" element={<PCOD />} />
          <Route path="/exercise" element={<Exercise />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/partner-dashboard" element={<PartnerDashboard />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/ask" element={<AskQuestion />} />
          <Route path="/community/query/:queryId" element={<QueryThread />} />
          <Route path="/doctors" element={<BrowseDoctors />} />
          <Route path="/doctors/:doctorId" element={<DoctorPublicProfile />} />
          <Route path="/notifications" element={<UserNotifications />} />
        </Route>

        {/* Doctor Dashboard routes */}
        <Route element={<DoctorProtectedRoute><DoctorLayout /></DoctorProtectedRoute>}>
          <Route path="/doctor-dashboard" element={<DoctorOverview />} />
          <Route path="/doctor-dashboard/queries" element={<DoctorQueries />} />
          <Route path="/doctor-dashboard/query/:queryId" element={<QueryThread />} />
          <Route path="/doctor-dashboard/notifications" element={<DoctorNotifications />} />
          <Route path="/doctor-dashboard/profile" element={<DoctorProfile />} />
        </Route>

        <Route path="/auth/doctor-register" element={<DoctorRegister />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  useEffect(() => {
    seedDoctors();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
