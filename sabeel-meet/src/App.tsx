import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { PageLoadingSkeleton } from './components/ui/Skeleton';

const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const ClassesPage = lazy(() =>
  import('./pages/ClassesPage').then((m) => ({ default: m.ClassesPage }))
);
const SchedulePage = lazy(() =>
  import('./pages/SchedulePage').then((m) => ({ default: m.SchedulePage }))
);
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage }))
);
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);
const MeetingRoomPage = lazy(() =>
  import('./pages/MeetingRoomPage').then((m) => ({ default: m.MeetingRoomPage }))
);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authReady, isAuthenticated } = useApp();
  if (!authReady) {
    return <div className="min-h-screen bg-[#F7FAFC] dark:bg-[#0B0F15]" />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AnimatedRoutes() {
  const location = useLocation();
  const { authReady, isAuthenticated } = useApp();

  if (!authReady) {
    return <div className="min-h-screen bg-[#F7FAFC] dark:bg-[#0B0F15]" />;
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7FAFC] dark:bg-[#0B0F15] p-6 sm:p-8 max-w-[1360px] mx-auto">
          <PageLoadingSkeleton />
        </div>
      }
    >
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
          />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/classes" element={<ClassesPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route
            path="/meeting"
            element={
              <ProtectedRoute>
                <MeetingRoomPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/meeting/:classId"
            element={
              <ProtectedRoute>
                <MeetingRoomPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
          />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AppProvider>
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </AppProvider>
    </MotionConfig>
  );
}
