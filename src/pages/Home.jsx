import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';

const Home = () => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="relative">
      {/* Tooltip Message */}
      <div
        id="dialog-message"
        className={`fixed bottom-10 right-24 bg-gray-50 dark:bg-gray-700 dark:text-white border-2 border-blue-200 text-sm rounded-lg p-3 shadow transition-opacity duration-300 ${
          isTooltipVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        Click me scan QR!
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => navigate("/scan-qr")}
        onMouseEnter={() => setIsTooltipVisible(true)}
        onMouseLeave={() => setIsTooltipVisible(false)}
        className="fixed bottom-8 right-8 bg-[#0f6013] text-white w-16 h-16 flex items-center justify-center space-x-2 rounded-full shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300"
      >
        <i className="fas fa-qrcode text-3xl"></i>
      </button>
    </div>
  );
};

export default Home;
