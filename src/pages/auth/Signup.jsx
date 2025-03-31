import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import apiService from "../../services/api";

import Logo from "../../assets/vismotor-splash-art.png";
import FooterLogo from "../../assets/vismotor-logo.jpg";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.auth.signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      });

      // Show success toast and redirect to login
      toast.success("Registration successful! Please check your email to verify your account.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Delay navigation slightly to allow toast to be visible
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Something went wrong. Please try again.";
      setError(errorMsg);
      
      toast.error(errorMsg, {
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <>
      <div className="flex min-h-screen bg-gradient-to-b from-[#538b30] to-[#003519]">
        {/* Right Column (Signup Form) */}
        <div className="flex items-center justify-center w-full p-10">
          <div className="bg-white p-10 rounded-xl shadow-lg w-[480px]">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h2>
            <p className="text-gray-600 mb-6">Join Vismotor Employee Information System</p>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    className="w-full p-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-0 focus:border-orange-500"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    className="w-full p-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-0 focus:border-orange-500"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  className="w-full p-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-0 focus:border-orange-500"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
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
                    name="password"
                    className="w-full p-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-0 focus:border-orange-500"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
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

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    className="w-full p-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-0 focus:border-orange-500"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
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
              </div>

              <button
                type="submit"
                className="w-full cursor-pointer bg-orange-500 hover:bg-[#538b30] text-white p-3 rounded-lg font-semibold transition duration-200"
                disabled={isLoading}
              >
                {isLoading ? "Signing up..." : "Sign Up"}
              </button>
            </form>

            <div className="mt-6 border-t border-gray-300"></div>

            <div className="mt-4 text-sm text-center">
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-orange-500 font-semibold hover:underline"
                >
                  Login
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

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

export default Signup;