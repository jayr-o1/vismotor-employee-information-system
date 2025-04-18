import React, { Suspense, lazy, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./utils/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Spinner from "./components/Layouts/Spinner";
import { ThemeContext } from "./ThemeContext";
import Layout from "./components/Layout";

// Lazy loaded components
const Login = lazy(() => import("./pages/auth/Login"));
const Signup = lazy(() => import("./pages/auth/Signup"));
const VerifyEmail = lazy(() => import("./pages/auth/VerifyEmail"));
const Home = lazy(() => import("./pages/Home"));
const Employees = lazy(() => import("./pages/Employees"));
const Applicants = lazy(() => import("./pages/Applicants"));
const ApplicantDetails = lazy(() => import("./pages/ApplicantDetails"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Settings = lazy(() => import("./pages/Settings"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const Documentation = lazy(() => import("./pages/Documentation"));
const NotFound = lazy(() => import("./components/NotFound"));

function App() {
  const { isDarkMode } = useContext(ThemeContext);
  
  return (
    <Router>
      <div className={`app ${isDarkMode ? 'dark-mode' : ''}`}>
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          theme={isDarkMode ? 'dark' : 'light'}
        />
        <Suspense fallback={
          <div className={`flex items-center justify-center h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <Spinner />
          </div>
        }>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/documentation" element={<Documentation />} />
            
            {/* Protected Routes wrapped in Layout */}
            <Route element={<ProtectedRoute element={<Layout />} />}>
              <Route path="/home" element={<Home />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/applicants" element={<Applicants />} />
              <Route path="/applicants/:id" element={<ApplicantDetails />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate replace to="/login" />} />
            
            {/* Not Found Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
