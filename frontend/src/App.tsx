import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import OrdersPage from "./pages/OrdersPage";
import StoresPage from "./pages/AdminPage";
import DisplayPage from "./pages/DisplayPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import { Toaster } from "./components/toaster";
import { useAtomValue } from "jotai";
import { isAuthenticatedAtom, sessionAtom } from "./store/auth";
import { useAuthService } from "./services/auth";
import { Loading } from "./components/loading";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const session = useAtomValue(sessionAtom);
  const { validateSession } = useAuthService();

  const { isLoading } = useQuery({
    queryKey: ["session", session?.access_token],
    queryFn: validateSession,
    enabled: !!session,
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#FFDFB5] backdrop-blur-sm">
        <Loading />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <StoresPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/:storeId"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route path="/:storeId" element={<DisplayPage />} />
        <Route path="/" element={<Navigate to="/auth" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="font-poppins">
        <AppRoutes />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
