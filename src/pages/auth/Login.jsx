import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import apiService from "../../services/api";
import { ThemeContext } from "../../ThemeContext";

import Logo from "../../assets/vismotor-splash-art.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  // Force light mode styles regardless of theme context
  useEffect(() => {
    // Apply light mode styles to this page
    const root = document.documentElement;
    const body = document.body;
    
    // Save current theme state
    const prevThemeClass = root.classList.contains('dark');
    const prevBgColor = body.style.backgroundColor;
    const prevTextColor = body.style.color;
    
    // Force light mode
    root.classList.remove('dark');
    body.style.backgroundColor = '#f8fafc'; // light background
    body.style.color = '#0f172a'; // dark text
    
    // Restore theme when component unmounts
    return () => {
      if (prevThemeClass) root.classList.add('dark');
      body.style.backgroundColor = prevBgColor;
      body.style.color = prevTextColor;
    };
  }, []);

  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail") || sessionStorage.getItem("savedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setUnverifiedEmail(null);
    setResendSuccess(false);
    setIsLoading(true);

    try {
      const response = await apiService.auth.login({ email, password });

      // Store user data in localStorage or context
      localStorage.setItem("userToken", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Save email if "Remember Me" is checked
      if (rememberMe) {
        localStorage.setItem("savedEmail", email);
      } else {
        sessionStorage.setItem("savedEmail", email);
      }

      // Show success toast
      toast.success("Login successful! Welcome back.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light" // Force light theme for toast
      });

      // Redirect to home page
      navigate("/home");
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        setUnverifiedEmail(error.response.data.email);
        setError("Your email address has not been verified. Please check your inbox or resend the verification email.");
        
        // Show warning toast
        toast.warning("Email verification required", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light" // Force light theme for toast
        });
      } else {
        setError(error.response?.data?.message || error.message || "Something went wrong. Please try again.");
        
        // Show error toast
        toast.error(error.response?.data?.message || "Login failed. Please check your credentials.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light" // Force light theme for toast
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    if (!unverifiedEmail) return;

    setIsResendingEmail(true);
    setResendSuccess(false);
    
    try {
      const response = await apiService.auth.resendVerification(unverifiedEmail);
      setResendSuccess(true);
      setError(""); // Clear error message
      
      // Show success toast
      toast.success("Verification email has been sent! Please check your inbox.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light" // Force light theme for toast
      });
    } catch (error) {
      setError(error.response?.data?.message || "Failed to resend verification email. Please try again.");
      
      // Show error toast
      toast.error("Failed to resend verification email. Please try again later.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light" // Force light theme for toast
      });
    } finally {
      setIsResendingEmail(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page">
      <div className="flex min-h-screen bg-gradient-to-b from-[#538b30] to-[#003519]">
        {/* Right Column (Login Form) */}
        <div className="flex items-center justify-center w-full p-10">
          <div className="bg-white p-10 rounded-xl shadow-lg w-[480px]">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Login</h2>
            <p className="text-gray-600 mb-6">Welcome back! We missed you!</p>
            
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
                {unverifiedEmail && (
                  <div className="mt-2">
                    <button
                      onClick={handleResendVerificationEmail}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                      disabled={isResendingEmail}
                    >
                      {isResendingEmail
                        ? "Sending..."
                        : resendSuccess
                        ? "Email sent successfully!"
                        : "Resend verification email"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full p-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-0 focus:border-orange-500"
                  placeholder="Enter your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full p-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-0 focus:border-orange-500"
                    placeholder="Enter your Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="text-gray-500 hover:text-gray-700" />
                    ) : (
                      <FaEye className="text-gray-500 hover:text-gray-700" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
                    Remember Me
                  </label>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-orange-500 text-sm font-semibold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-3 text-white font-medium rounded-lg ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-orange-500 hover:bg-orange-600"
                }`}
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 border-t border-gray-300"></div>

            <div className="mt-4 text-sm text-center">
              <p>
                Access is restricted to authorized personnel only.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toast container for alerts */}
      <ToastContainer theme="light" />
    </div>
  );
};

export default Login;