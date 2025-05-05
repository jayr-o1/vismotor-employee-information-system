import React, { Suspense, lazy, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./utils/ProtectedRoute";
import AuthRoute from "./utils/AuthRoute";
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
const EmployeeDetails = lazy(() => import("./pages/EmployeeDetails"));
const Applicants = lazy(() => import("./pages/Applicants"));
const ApplicantDetails = lazy(() => import("./pages/ApplicantDetails"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Settings = lazy(() => import("./pages/Settings"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const Documentation = lazy(() => import("./pages/Documentation"));
const NotFound = lazy(() => import("./components/NotFound"));
const ApplicantQRProfile = lazy(() => import("./pages/ApplicantQRProfile"));
const EmployeeQRProfile = lazy(() => import("./pages/EmployeeQRProfile"));
const ApplicationForm = lazy(() => import("./forms/ApplicationForm"));
const OnboardingDetails = lazy(() => import("./pages/OnboardingDetails"));

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
            {/* Public Auth Routes - Redirect to home if already logged in */}
            <Route path="/login" element={<AuthRoute element={<Login />} />} />
            <Route path="/signup" element={<AuthRoute element={<Signup />} />} />
            <Route path="/verify-email" element={<AuthRoute element={<VerifyEmail />} />} />
            <Route path="/forgot-password" element={<AuthRoute element={<ForgotPassword />} />} />
            <Route path="/reset-password" element={<AuthRoute element={<ResetPassword />} />} />
            
            {/* Truly Public Routes */}
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/apply" element={
              <div className="light-mode">
                <ApplicationForm />
              </div>
            } />
            {/* QR Profile Public Route */}
            <Route path="/qr/applicant/:id" element={<ApplicantQRProfile />} />
            <Route path="/qr/employee/:id" element={<EmployeeQRProfile />} />
            
            {/* Protected Routes wrapped in Layout */}
            <Route element={<ProtectedRoute element={<Layout />} />}>
              <Route path="/home" element={<Home />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/employees/:id" element={<EmployeeDetails />} />
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
