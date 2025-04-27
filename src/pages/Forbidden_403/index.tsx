import React from 'react';

const NotFoundPage = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="flex items-center space-x-5 text-gray-700">
        <span className="text-3xl font-semibold">403</span>
        <div className="w-px h-6 bg-gray-300"></div>
        <span className="text-lg">This page is Forbidden</span>
      </div>
    </div>
  );
};

export default NotFoundPage;
