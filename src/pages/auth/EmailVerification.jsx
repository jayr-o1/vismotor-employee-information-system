import { useLocation, useNavigate } from "react-router-dom";

const EmailVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "your email";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#538b30] to-[#003519]">
      <div className="bg-white p-10 rounded-xl shadow-lg w-[480px]">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          Verify Your Email
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          We've sent a verification link to{" "}
          <span className="font-semibold">{email}</span>. Please check your inbox
          and follow the link to verify your account.
        </p>

        <button
          className="w-full cursor-pointer bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-lg font-semibold transition duration-200"
          onClick={() => navigate("/login")}
        >
          Go to Login
        </button>

        <div className="mt-6 border-t border-gray-300"></div>

        <div className="mt-4 text-sm text-center">
          <p>
            Didn't receive the email?{" "}
            <a
              href="/resend-verification"
              className="text-orange-500 font-semibold hover:underline"
            >
              Resend Verification Link
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;