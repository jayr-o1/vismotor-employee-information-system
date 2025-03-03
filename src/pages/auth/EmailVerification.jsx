import { useLocation, useNavigate } from "react-router-dom";

const EmailVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "your email";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] text-center">
        <h2 className="text-xl font-bold text-gray-800">Verify Your Email</h2>
        <p className="text-gray-600 mt-2">
          We've sent a verification link to <span className="font-semibold">{email}</span>.
        </p>
        <p className="text-gray-600">Please check your inbox and follow the link to verify your account.</p>
        <button
          className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
          onClick={() => navigate("/login")}
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default EmailVerification;
