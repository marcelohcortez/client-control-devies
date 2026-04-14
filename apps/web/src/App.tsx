import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { registerTokenGetter } from "./services/api";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ClientDetailPage from "./pages/ClientDetailPage";
import AddClientPage from "./pages/AddClientPage";
import EditClientPage from "./pages/EditClientPage";

// Wire the token getter so the API service can attach the Bearer header
function TokenRegistrar() {
  const { accessToken } = useAuth();
  registerTokenGetter(() => accessToken);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TokenRegistrar />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected */}
          <Route
            path="/clients"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients/new"
            element={
              <ProtectedRoute>
                <AddClientPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients/:id"
            element={
              <ProtectedRoute>
                <ClientDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients/:id/edit"
            element={
              <ProtectedRoute>
                <EditClientPage />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/clients" replace />} />
          <Route path="*" element={<Navigate to="/clients" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
