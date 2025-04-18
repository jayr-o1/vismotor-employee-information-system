import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import apiService from "../../services/api";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [passwordMatchError, setPasswordMatchError] = useState("");
  const [passwordMatchSuccess, setPasswordMatchSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate inputs
    if (!newPassword || !confirmPassword) {
      setError("Both fields are required!");
      toast.error("Both fields are required!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      toast.error("Passwords do not match!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setIsLoading(false);
      return;
    }

    try {
      // Send a request to the backend
      const response = await apiService.auth.resetPassword({
        token,
        newPassword,
      });

      // Display success message
      const successMessage = response.data.message || "Password has been reset successfully!";
      setMessage(successMessage);
      setError("");
      
      toast.success(successMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Redirect to the login page after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      // Handle errors
      const errorMessage = error.response?.data?.message || "Something went wrong. Please try again later.";
      setError(errorMessage);
      setMessage("");
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time validation for password matching
  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);

    if (newPassword !== value) {
      setPasswordMatchError("Passwords do not match!");
      setPasswordMatchSuccess("");
    } else {
      setPasswordMatchError("");
      setPasswordMatchSuccess("Passwords match!");
    }
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#538b30] to-[#003519]">
      <div className="bg-white p-10 rounded-xl shadow-lg w-[480px]">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          Reset Password
        </h2>
        {message && <p className="text-green-500 text-center mb-4">{message}</p>}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                className="w-full p-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-0 focus:border-orange-500"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={toggleNewPasswordVisibility}
              >
                {showNewPassword ? (
                  <FaEyeSlash className="text-gray-500 hover:text-gray-700" />
                ) : (
                  <FaEye className="text-gray-500 hover:text-gray-700" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full p-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-0 focus:border-orange-500"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange} // Use the new handler
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? (
                  <FaEyeSlash className="text-gray-500 hover:text-gray-700" />
                ) : (
                  <FaEye className="text-gray-500 hover:text-gray-700" />
                )}
              </button>
            </div>
            {passwordMatchError && (
              <p className="text-red-500 text-sm mt-1">{passwordMatchError}</p>
            )}
            {passwordMatchSuccess && (
              <p className="text-green-500 text-sm mt-1">{passwordMatchSuccess}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full cursor-pointer bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-lg font-semibold transition duration-200"
            disabled={isLoading}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ResetPassword;