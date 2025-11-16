// import { Routes, Route } from "react-router-dom";
// import AppShell from "./components/layout/AppShell.jsx";

// import HomeScreen from "./screens/HomeScreen.jsx";
// import ChatScreen from "./screens/ChatScreen.jsx";
// import FinderScreen from "./screens/FinderScreen.jsx";
// import MyPanchayatScreen from "./screens/MyPanchayatScreen.jsx";


// function App() {
//   return (
//     <AppShell>
//       <Routes>
//         <Route path="/" element={<HomeScreen />} />
//         <Route path="/chat" element={<ChatScreen />} />
//         <Route path="/finder" element={<FinderScreen />} />
//         <Route path="/my-panchayat" element={<MyPanchayatScreen />} />
//       </Routes>
//     </AppShell>
//   );
// }

// export default App;


// src/App.jsx
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// // Screens you already have
// import HomeScreen from "./screens/HomeScreen.jsx";
// import FinderScreen from "./screens/FinderScreen.jsx";

// // New / updated screens (add these files if missing)
// import MyPanchayatScreen from "./screens/MyPanchayatScreen.jsx";
// // import GramPlanningScreen from "./screens/GramPlanningScreen.jsx";

// export default function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Home */}
//         <Route path="/" element={<HomeScreen />} />

//         {/* My Panchayat hub: shows two options */}
//         <Route path="/meri-panchayat" element={<MyPanchayatScreen />} />

//         {/* Option 1: Training Finder (existing feature) */}
//         <Route path="/meri-panchayat/trainings" element={<FinderScreen />} />

//         {/* Option 2: Gram Planning Tool (new feature) */}
//         <Route path="/meri-panchayat/planning" element={<GramPlanningScreen />} />

//         {/* Fallback */}
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }


// import { Routes, Route } from "react-router-dom";
// import AppShell from "./components/layout/AppShell.jsx";

// import HomeScreen from "./screens/HomeScreen.jsx";
// import ChatScreen from "./screens/ChatScreen.jsx";
// import FinderScreen from "./screens/FinderScreen.jsx";
// import MyPanchayatScreen from "./screens/MyPanchayatScreen.jsx";
// import GramPlanningTool from "./gram_tool.jsx"; // 👈 NEW

// function App() {
//   return (
//     <AppShell>
//       <Routes>
//         <Route path="/" element={<HomeScreen />} />
//         <Route path="/chat" element={<ChatScreen />} />
//         <Route path="/finder" element={<FinderScreen />} />
//         <Route path="/my-panchayat" element={<MyPanchayatScreen />} />

//         {/* NEW: Gram Planning route */}
//         <Route
//           path="/my-panchayat/planning"
//           element={<GramPlanningTool />}
//         />
//       </Routes>
//     </AppShell>
//   );
// }

// export default App;




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
