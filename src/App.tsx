import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { generateInitialAttendance, generateInitialMarks, generateInitialFees } from './utils/mockData';
import { storageUtils } from './utils/storage';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Index from './pages/Index';
import ClassTeacherDashboard from './pages/ClassTeacherDashboard';
import SubjectTeacherDashboard from './pages/SubjectTeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';

const queryClient = new QueryClient();

// Initialize mock data in localStorage if not exists
const initializeMockData = () => {
  if (storageUtils.getAttendance().length === 0) {
    storageUtils.saveAttendance(generateInitialAttendance());
  }
  if (storageUtils.getMarks().length === 0) {
    storageUtils.saveMarks(generateInitialMarks());
  }
  if (storageUtils.getFees().length === 0) {
    storageUtils.saveFees(generateInitialFees());
  }
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

const DashboardRouter = () => {
  const { currentUser } = useAuth();

  if (!currentUser) return <Navigate to="/" />;

  switch (currentUser.role) {
    case 'class_teacher':
      return <ClassTeacherDashboard />;
    case 'subject_teacher':
      return <SubjectTeacherDashboard />;
    case 'student':
      return <StudentDashboard />;
    default:
      return <Navigate to="/" />;
  }
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    initializeMockData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;