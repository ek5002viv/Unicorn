import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoadingSpinner } from './components/LoadingSpinner';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { ListClothingPage } from './pages/ListClothingPage';
import { BuyButtonsPage } from './pages/BuyButtonsPage';
import { SellButtonsPage } from './pages/SellButtonsPage';
import { RecentActivityPage } from './pages/RecentActivityPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function CheckOnboarding({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (profile && profile.button_balance === 0 && profile.total_buttons_earned === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/auth"
        element={
          <AuthRoute>
            <AuthPage />
          </AuthRoute>
        }
      />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <CheckOnboarding>
              <DashboardPage />
            </CheckOnboarding>
          </ProtectedRoute>
        }
      />
      <Route
        path="/marketplace"
        element={
          <ProtectedRoute>
            <CheckOnboarding>
              <MarketplacePage />
            </CheckOnboarding>
          </ProtectedRoute>
        }
      />
      <Route
        path="/list-clothing"
        element={
          <ProtectedRoute>
            <ListClothingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buy-buttons"
        element={
          <ProtectedRoute>
            <BuyButtonsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sell-buttons"
        element={
          <ProtectedRoute>
            <SellButtonsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/activity"
        element={
          <ProtectedRoute>
            <RecentActivityPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
