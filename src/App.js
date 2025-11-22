// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import EndUsersPage from "./pages/EndUsersPage";
;import CollectorsPage from "./pages/CollectorsPage";
import AttendancePage from './pages/AttendancePage';
import DumpsPage from './pages/DumpsPage';
import ImageVerificationPage from './pages/ImageVerificationPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import AnalyticsPage from './pages/AnalyticsPage';
import FeedbackPage from './pages/FeedbackPage';
import SettingsPage from './pages/SettingsPage';
import GarbageRequestsPage from './pages/GarbageRequestsPage'; // Import the new page
import 'leaflet/dist/leaflet.css';




const App = () => {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    
    <Router>
      <Routes>
         <Route path="/end-users" element={<EndUsersPage />} />
        <Route path="/collectors" element={<CollectorsPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/login" />} />
        <Route
  path="/attendance"
  element={user ? <AttendancePage /> : <Navigate to="/login" />}
/>
<Route
  path="/dumps"
  element={user ? <DumpsPage /> : <Navigate to="/login" />}
/>
<Route
  path="/image-verification"
  element={user ? <ImageVerificationPage /> : <Navigate to="/login" />}
/>

<Route
  path="/analytics"
  element={user ? <AnalyticsPage /> : <Navigate to="/login" />}
/>
<Route
  path="/feedback"
  element={user ? <FeedbackPage /> : <Navigate to="/login" />}
/>
<Route
  path="/settings"
  element={user ? <SettingsPage /> : <Navigate to="/login" />}
/>
<Route
  path="/garbage-requests"
  element={user ? <GarbageRequestsPage /> : <Navigate to="/login" />}
/>

        <Route path="/end-users" element={<EndUsersPage />} />

      </Routes>
    </Router>
  );
};

export default App;
