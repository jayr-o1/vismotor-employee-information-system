import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import apiService from "../../services/api";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [verificationStatus, setVerificationStatus] = useState({
    loading: true,
    success: false,
    message: "Verifying your email..."
  });
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationStatus({
          loading: false,
          success: false,
          message: "Invalid verification link. No token provided."
        });
        
        toast.error("Invalid verification link. No token provided.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }

      try {
        const response = await apiService.auth.verifyEmail(token);
        setVerificationStatus({
          loading: false,
          success: true,
          message: "Email verified successfully! You can now login to your account."
        });
        
        toast.success("Email verified successfully! You can now login to your account.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } catch (error) {
        const errorMsg = error.response?.data?.message || "Failed to verify email. The link may be expired or invalid.";
        setVerificationStatus({
          loading: false,
          success: false,
          message: errorMsg
        });
        
        toast.error(errorMsg, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#538b30] to-[#003519] p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        {verificationStatus.loading ? (
          <div className="py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-700">{verificationStatus.message}</p>
          </div>
        ) : (
          <div className="py-8">
            {verificationStatus.success ? (
              <FaCheckCircle className="text-green-500 text-5xl mx-auto" />
            ) : (
              <FaTimesCircle className="text-red-500 text-5xl mx-auto" />
            )}
            <h2 className={`text-xl font-semibold mt-4 ${verificationStatus.success ? 'text-green-600' : 'text-red-600'}`}>
              {verificationStatus.success ? 'Email Verified!' : 'Verification Failed'}
            </h2>
            <p className="mt-2 text-gray-700">
              {verificationStatus.message}
            </p>
            <button
              onClick={() => navigate("/login")}
              className="mt-6 bg-orange-500 hover:bg-[#538b30] text-white px-6 py-2 rounded-lg font-semibold transition duration-200"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default VerifyEmail; 