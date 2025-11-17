



import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/layout/AppShell.jsx";

import HomeScreen from "./screens/HomeScreen.jsx";
import ChatScreen from "./screens/ChatScreen.jsx";
import FinderScreen from "./screens/FinderScreen.jsx";
import MyPanchayatScreen from "./screens/MyPanchayatScreen.jsx";
import TrainingFinderScreen from "./screens/TrainingFinderScreen.jsx";
import GramPlanningTool from "./gram_tool.jsx";

import LoginScreen from "./screens/LoginScreen.jsx";
import RegisterScreen from "./screens/RegisterScreen.jsx";
import DashboardScreen from "./screens/DashboardScreen.jsx";
import EditProfileScreen from "./screens/EditProfileScreen.jsx";

import { useAuth } from "./auth/useAuth.jsx";

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/chat" element={<ChatScreen />} />
        <Route path="/finder" element={<FinderScreen />} />

        {/* Meri Panchayat hub */}
        <Route path="/my-panchayat" element={<MyPanchayatScreen />} />

        {/* Option 1: Trainings */}
        <Route
          path="/my-panchayat/trainings"
          element={<TrainingFinderScreen />}
        />

        {/* Option 2: Gram Planning Tool */}
        <Route
          path="/my-panchayat/planning"
          element={<GramPlanningTool />}
        />

        {/* Auth */}
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />

        {/* Personalised area */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <EditProfileScreen />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

export default App;
