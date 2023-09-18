'use client'
import React from 'react';

const AccountPage = () => {
  // Replace these dummy user details with actual user data from your authentication system
  const user = {
    firstName: 'john',
    lastName: 'doe',
    email: 'johndoe@example.com',
    phone : '1234567890',
    password: 'password',
    // Add more user information here
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="bg-white p-8 rounded shadow-md w-96 mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Account Information</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <p className="text-lg text-gray-900">{user.firstName}</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <p className="text-lg text-gray-900">{user.lastName}</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <p className="text-lg text-gray-900">{user.email}</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <p className="text-lg text-gray-900">{user.phone}</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <p className="text-lg text-gray-900">{user.password}</p>
        </div>
        {/* Add more user information fields as needed */}
        <div className="flex justify-end">
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-200"
            onClick={() => {
              // Implement a function to edit user information
            }}
          >
            Edit Information
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
