import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleReset = (e) => {
    e.preventDefault();
    // Replace with Firebase password reset logic
    alert("Password reset link sent to your email.");
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

          <button className="w-full cursor-pointer bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-lg font-semibold transition duration-200">
            Send Reset Link
          </button>
        </form>

        <div className="mt-6 border-t border-gray-300"></div>

        <div className="mt-4 text-sm text-center">
          <p>
            Remember your password?{" "}
            <a
              href="/login"
              className="text-orange-500 font-semibold hover:underline"
            >
              Back to Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
