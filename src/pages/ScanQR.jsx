import React, { useState, useEffect } from "react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";

const ScanQR = () => {
  const [scanResult, setScanResult] = useState("");
  const [qrImage, setQrImage] = useState("");

  // Initialize QR Code Scanner
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("qr-scanner", {
      qrbox: { width: 250, height: 250 },
      fps: 5,
    });

    scanner.render(
      (data) => {
        setScanResult(data);
        scanner.clear(); // Stop scanning after a result is found
      },
      (error) => {
        console.error(error);
      }
    );

    return () => {
      scanner.clear(); // Clean up on component unmount
    };
  }, []);

  return (
    <div className="flex flex-col items-center p-6 space-y-6 bg-gray-100 min-h-screen">
      {/* Upload & Generate QR - Side by Side */}
      <div className="flex w-full justify-center space-x-6">
        {/* Scan QR - Below */}
        <div className="p-4 bg-white shadow-lg rounded-lg w-full max-w-md text-center">
          <h2 className="text-lg font-semibold mb-2">Scan QR Code</h2>
          <div id="qr-scanner" className="w-full border p-4 rounded-lg"></div>
          <p className="mt-4 text-sm text-gray-600">
            Scanned Result: <span className="font-semibold">{scanResult}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScanQR;
