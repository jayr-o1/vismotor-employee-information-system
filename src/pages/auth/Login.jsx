import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import apiService from "../../services/api";

import Logo from "../../assets/vismotor-splash-art.png";
import FooterLogo from "../../assets/vismotor-logo.jpg";

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
      });
    } finally {
      setIsResendingEmail(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <div className="flex min-h-screen bg-gradient-to-b from-[#538b30] to-[#003519]">
        {/* Right Column (Login Form) */}
        <div className="flex items-center justify-center w-full p-10">
          <div className="bg-white p-10 rounded-xl shadow-lg w-[480px]">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Login</h2>
            <p className="text-gray-600 mb-6">Welcome back! We missed you!</p>

            {/* Error message */}
            {error && (
              <div className="mb-4">
                <p className="text-red-500">{error}</p>
                {unverifiedEmail && (
                  <button
                    type="button"
                    onClick={handleResendVerificationEmail}
                    disabled={isResendingEmail}
                    className="mt-2 text-orange-500 hover:text-orange-700 font-semibold text-sm"
                  >
                    {isResendingEmail ? "Sending..." : "Resend verification email"}
                  </button>
                )}
              </div>
            )}

            {/* Success message for resent email */}
            {resendSuccess && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                Verification email has been sent! Please check your inbox.
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  E-Mail
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
                className="w-full cursor-pointer bg-orange-500 hover:bg-[#538b30] text-white p-3 rounded-lg font-semibold transition duration-200"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="mt-6 border-t border-gray-300"></div>

            <div className="mt-4 text-sm text-center">
              <p>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="text-orange-500 font-semibold hover:underline"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toast container for alerts */}
      <ToastContainer />

      <footer className="w-full py-4 md:py-6 bg-orange-500 flex flex-col md:flex-row items-center justify-between px-6 md:px-10 text-white">
        {/* Left - Logo & Address */}
        <div className="flex flex-col md:flex-row items-center md:items-center space-y-4 md:space-y-0 md:space-x-6">
          <img
            src={FooterLogo}
            alt="Vismotor Logo"
            className="h-20 md:h-24 rounded-full shadow-lg"
          />
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-1">
            <p className="text-md">
              9W68+643, Carmel Drive cor, Gov. M. Cuenco Ave, Cebu City, Cebu
            </p>
            <p className="text-md">
              contact@vismotor.com | +123 456 7890
            </p>
          </div>
        </div>

        {/* Center - Copyright */}
        <p className="text-md font-semibold text-center w-full md:w-auto">
          &copy; {new Date().getFullYear()} Vismotor Employee Information System
          <br />
          <button
            onClick={() => navigate("/documentation")}
            className="text-white hover:text-gray-200 underline text-sm"
          >
            View Documentation
          </button>
        </p>

        {/* Right - Social Media & Links */}
        <div className="flex flex-col items-center md:items-end space-y-3">
          <div className="flex space-x-4">
            <a href="#" className="text-white hover:text-[#538b30] transition">
              <FaFacebook size={24} />
            </a>
            <a href="#" className="text-white hover:text-[#538b30] transition">
              <FaTwitter size={24} />
            </a>
            <a href="#" className="text-white hover:text-[#538b30] transition">
              <FaInstagram size={24} />
            </a>
            <a href="#" className="text-white hover:text-[#538b30] transition">
              <FaLinkedin size={24} />
            </a>
          </div>
          <p className="text-sm">Privacy Policy | Terms of Service</p>
        </div>
      </footer>
    </>
  );
};

export default Login;