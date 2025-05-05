import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../ThemeContext";

const OnboardingDetails = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate('/onboarding')}
              className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <h1 className="text-2xl font-semibold">Onboarding Details</h1>
          </div>
        </div>
        
        <div className={`${isDark ? 'bg-[#232f46] border border-slate-700' : 'bg-white border border-gray-200'} rounded-xl shadow-md p-6 flex justify-center items-center h-64`}>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Onboarding details placeholder
          </p>
        </div>
      </div>
    </>
  );
};

export default OnboardingDetails; 