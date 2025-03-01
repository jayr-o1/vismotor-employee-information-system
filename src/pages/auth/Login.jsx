import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Logo from "../../assets/vismotor-splash-art.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Replace with Firebase authentication logic
    localStorage.setItem("userToken", "fakeToken");
    navigate("/home");
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Column (Logo & System Name) */}
      <div className="hidden md:flex items-center justify-center w-1/2 text-center p-10">
        <div>
          <img src={Logo} alt="Vismotor Logo" className="-mt-70 w-150 mx-auto mb-4" />
          
          <h2 className="-mt-3 text-2xl font-semibold">
            Employee Information System
          </h2>
        </div>
      </div>

      {/* Right Column (Login Form) */}
      <div className="flex items-center justify-center w-full md:w-1/2 p-10 bg-red-500">
        <div className="bg-white p-10 rounded-xl shadow-lg w-[480px]">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Login</h2>
          <p className="text-gray-600 mb-6">Welcome back! We missed you!</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                E-Mail
              </label>
              <input
                type="email"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
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
              <input
                type="password"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="text-right mt-1">
                <a
                  href="/forgot-password"
                  className="text-red-500 text-sm font-semibold hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
            </div>

            <button className="w-full bg-red-500 hover:bg-red-600 text-white p-3 rounded-lg font-semibold transition duration-200">
              Login
            </button>
          </form>

          <div className="mt-6 border-t border-gray-300"></div>

          <div className="mt-4 text-sm text-center">
            <p>
              Don't have an account?{" "}
              <a
                href="/signup"
                className="text-red-500 font-semibold hover:underline"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
