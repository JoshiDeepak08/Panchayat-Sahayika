



import { Routes, Route } from "react-router-dom";
import AppShell from "./components/layout/AppShell.jsx";

import HomeScreen from "./screens/HomeScreen.jsx";
import ChatScreen from "./screens/ChatScreen.jsx";
import FinderScreen from "./screens/FinderScreen.jsx"; // schemes finder
import MyPanchayatScreen from "./screens/MyPanchayatScreen.jsx";
import TrainingFinderScreen from "./screens/TrainingFinderScreen.jsx"; // 👈 new
import GramPlanningTool from "./gram_tool.jsx"; // 👈 planning tool

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
      </Routes>
    </AppShell>
  );
}

export default App;
