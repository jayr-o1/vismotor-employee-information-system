import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import apiService from "../../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email) {
      setError("Email is required!");
      toast.error("Email is required!", {
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
      const response = await apiService.auth.forgotPassword({ email });

      // Display success message
      const successMessage = response.data.message || "Password reset link has been sent to your email.";
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#538b30] to-[#003519]">
      <div className="bg-white p-10 rounded-xl shadow-lg w-[480px]">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          Reset Password
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          Enter your email, and we'll send a reset link.
        </p>

        {/* Display success or error messages */}
        {message && <p className="text-green-500 text-center mb-4">{message}</p>}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleReset} className="space-y-4">
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

          <button
            type="submit"
            className="w-full cursor-pointer bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-lg font-semibold transition duration-200"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 border-t border-gray-300"></div>

        <div className="mt-4 text-sm text-center">
          <p>
            Remember your password?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-orange-500 font-semibold hover:underline"
            >
              Back to Login
            </button>
          </p>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ForgotPassword;  