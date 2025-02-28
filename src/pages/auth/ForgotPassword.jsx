import React, { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleReset = (e) => {
    e.preventDefault();
    // Replace with Firebase password reset logic
    alert("Password reset link sent to your email.");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-xl font-semibold mb-4">Reset Password</h2>
        <form onSubmit={handleReset}>
          <input
            type="email"
            className="w-full p-2 border rounded mb-3"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="w-full bg-red-500 text-white p-2 rounded">
            Reset Password
          </button>
        </form>
        <div className="mt-4 text-sm">
          <p>
            <a href="/login" className="text-blue-500">Back to Login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
