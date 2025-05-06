import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import apiService from "../../services/api";
import { ThemeContext } from "../../ThemeContext";
import Banner from "../../assets/vismotor_banner.png";

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
  const isDark = theme === 'dark';

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
        theme: isDark ? "dark" : "light"
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
          theme: isDark ? "dark" : "light"
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
          theme: isDark ? "dark" : "light"
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
        theme: isDark ? "dark" : "light"
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
        theme: isDark ? "dark" : "light"
      });
    } finally {
      setIsResendingEmail(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${
      isDark 
        ? 'from-gray-900 to-gray-800' 
        : 'from-[#538b30] to-[#003519]'
    }`}>
      <ToastContainer theme={isDark ? "dark" : "light"} />
      
      <div className={`w-full max-w-lg p-8 rounded-xl shadow-xl ${
        isDark 
          ? 'bg-[#1B2537] border border-slate-700' 
          : 'bg-white border border-gray-200'
      }`}>
        <div className="text-center mb-8">
          <img src={Banner} alt="Vismotor" className="w-full object-cover mb-4" />
        </div>
        
        {error && (
          <div className={`mb-6 p-4 rounded-lg ${
            isDark 
              ? 'bg-red-900/20 border border-red-800 text-red-200' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle mr-2"></i>
              <span>{error}</span>
            </div>
            {unverifiedEmail && (
              <div className="mt-3 ml-6">
                <button
                  onClick={handleResendVerificationEmail}
                  disabled={isResendingEmail}
                  className={`text-sm font-medium ${
                    isDark 
                      ? 'text-blue-400 hover:text-blue-300' 
                      : 'text-blue-600 hover:text-blue-800'
                  }`}
                >
                  {isResendingEmail
                    ? <><i className="fas fa-spinner fa-spin mr-2"></i>Sending...</>
                    : resendSuccess
                    ? <><i className="fas fa-check mr-2"></i>Email sent successfully!</>
                    : <><i className="fas fa-paper-plane mr-2"></i>Resend verification email</>}
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Email Address
            </label>
            <input
              type="email"
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark 
                  ? 'bg-slate-700 border-slate-600 text-white focus:ring-green-500 focus:border-green-500' 
                  : 'bg-white border-gray-300 text-gray-800 focus:ring-green-500 focus:border-green-500'
              } focus:outline-none focus:ring-2`}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white focus:ring-green-500 focus:border-green-500' 
                    : 'bg-white border-gray-300 text-gray-800 focus:ring-green-500 focus:border-green-500'
                } focus:outline-none focus:ring-2`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                  isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                onChange={(e) => setRememberMe(e.target.checked)}
                className={`h-4 w-4 rounded border-gray-300 ${
                  isDark ? 'text-green-500 focus:ring-green-600' : 'text-green-600 focus:ring-green-500'
                }`}
              />
              <label 
                htmlFor="rememberMe" 
                className={`ml-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Remember me
              </label>
            </div>
            <div>
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className={`text-sm font-medium ${
                  isDark ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-700'
                }`}
              >
                Forgot password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 flex justify-center items-center rounded-lg font-medium transition-colors ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed text-white' 
                : isDark 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <div className={`mt-6 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <p>Access is restricted to authorized personnel only.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;