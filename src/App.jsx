import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./utils/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Spinner from "./components/Layouts/Spinner";

// Lazy loaded components
const Login = lazy(() => import("./pages/auth/Login"));
const Home = lazy(() => import("./pages/Home"));
const Employees = lazy(() => import("./pages/Employees"));
const Applicants = lazy(() => import("./pages/Applicants"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Settings = lazy(() => import("./pages/Settings"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const NotFound = lazy(() => import("./components/NotFound"));

function App() {
  return (
    <Router>
      <div className="app">
        <ToastContainer position="top-right" autoClose={3000} />
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><Spinner /></div>}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected Routes */}
            <Route path="/home" element={<ProtectedRoute element={<Home />} />} />
            <Route path="/employees" element={<ProtectedRoute element={<Employees />} />} />
            <Route path="/applicants" element={<ProtectedRoute element={<Applicants />} />} />
            <Route path="/onboarding" element={<ProtectedRoute element={<Onboarding />} />} />
            <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} />
            
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
