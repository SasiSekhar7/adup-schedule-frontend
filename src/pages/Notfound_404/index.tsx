import React from 'react';

const NotFound = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center h-screen bg-white z-50">
      <div className="flex items-center space-x-5 text-gray-700">
        <span className="text-3xl font-semibold">404</span>
        <div className="w-px h-6 bg-gray-300"></div>
        <span className="text-lg">This page is not found</span>
      </div>
    </div>
  );
};

export default NotFound;
