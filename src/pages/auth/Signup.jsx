import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Replace with Firebase signup logic
    localStorage.setItem("userToken", "fakeToken");
    navigate("/home");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-xl shadow-lg w-[480px]">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign Up</h2>
        <p className="text-gray-600 mb-6">Join us today!</p>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">E-Mail</label>
            <input
              type="email"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Confirm your Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button className="w-full bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg font-semibold transition duration-200">
            Sign Up
          </button>
        </form>

        {/* Divider Line */}
        <div className="mt-6 border-t border-gray-300"></div>

        <div className="mt-4 text-sm text-center">
          <p>
            Already have an account?{" "}
            <a href="/login" className="text-green-500 font-semibold hover:underline">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
