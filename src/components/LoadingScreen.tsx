import React from "react";

interface LoadingScreenProps {
  text?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ text = "Page Loading..." }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="flex flex-col items-center space-y-6">
        
        {/* Morphing / pulsing gradient loader */}
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 rounded-full bg-white/30 blur-xl animate-ping"></div>
        </div>

        {/* Loading text */}
        <p className="text-gray-700 font-semibold text-lg animate-pulse">
          {text}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
