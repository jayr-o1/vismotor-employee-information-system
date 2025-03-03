import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

import Logo from "../../assets/vismotor-splash-art.png";
import FooterLogo from "../../assets/vismotor-logo.jpg";

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
    <>
      <div className="flex min-h-screen bg-gradient-to-b from-[#538b30] to-[#003519]">

        {/* Right Column (Login Form) */}
        <div className="flex items-center justify-center w-full p-10">
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
                <input
                  type="password"
                  className="w-full p-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-0 focus:border-orange-500"
                  placeholder="Enter your Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <div className="text-right mt-1">
                  <a
                    href="/forgot-password"
                    className="text-orange-500 text-sm font-semibold hover:underline"
                  >
                    Forgot Password?
                  </a>
                </div>
              </div>

              <button className="w-full cursor-pointer bg-orange-500 hover:bg-[#538b30] text-white p-3 rounded-lg font-semibold transition duration-200">
                Login
              </button>
            </form>

            <div className="mt-6 border-t border-gray-300"></div>

            <div className="mt-4 text-sm text-center">
              <p>
                Don't have an account?{" "}
                <a
                  href="/signup"
                  className="text-orange-500 font-semibold hover:underline"
                >
                  Sign up
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

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
