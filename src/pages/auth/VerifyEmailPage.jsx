import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";

const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link!");
      return;
    }

    fetch(`http://10.10.1.71:5000/api/verify-email?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "Email verified successfully!") {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.message);
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong!");
      });
  }, [location]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#538b30] to-[#003519]">
      <div className="bg-white p-10 rounded-xl shadow-lg w-[480px] text-center">
        {status === "loading" ? (
          <p className="text-gray-600">Verifying email...</p>
        ) : status === "success" ? (
          <>
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Success!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              className="w-full bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-lg font-semibold transition duration-200"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </button>
          </>
        ) : (
          <>
            <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              className="w-full bg-gray-500 hover:bg-gray-600 text-white p-3 rounded-lg font-semibold transition duration-200"
              onClick={() => navigate("/")}
            >
              Go to Homepage
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
