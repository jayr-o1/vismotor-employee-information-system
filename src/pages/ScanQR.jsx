import React, { useState, useEffect, useContext } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ThemeContext } from '../ThemeContext';

const ScanQR = () => {
  const { isDarkMode } = useContext(ThemeContext);  // Use the ThemeContext
  const [scanResult, setScanResult] = useState(""); // State to store QR scan result

  // Initialize QR Code Scanner
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("qr-scanner", {
      qrbox: { width: 250, height: 250 },
      fps: 5,
    });

    scanner.render(
      (data) => {
        setScanResult(data);  // Set scan result
        scanner.clear();  // Stop scanning after a result is found
      },
      (error) => {
        console.error(error);
      }
    );

    return () => {
      scanner.clear();  // Clean up on component unmount
    };
  }, []);

  return (
    <div className={`flex flex-col items-center p-6 space-y-6 min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      {/* Scan QR Section */}
      <div className="flex w-full justify-center space-x-6">
        <div className={`p-4 shadow-lg rounded-lg w-full max-w-md text-center ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
          <h2 className="text-lg font-semibold mb-2">Scan QR Code</h2>
          <div id="qr-scanner" className={`w-full border p-4 rounded-lg ${isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-300 bg-gray-100'}`}></div>
          <p className={`mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Scanned Result: <span className="font-semibold">{scanResult}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScanQR;
