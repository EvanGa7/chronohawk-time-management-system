'use client'
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'; // Import useRouter hook

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const NewAccount = () => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    phone: '',
    email: '',
    password: '',
  });

  const router = useRouter(); // Call the useRouter hook

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });
    if (data?.user) {
      // Handle success
      alert('Account Created Successfully!');
  
      // Insert additional user data into the 'users' table
      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          userid: data.user.id, // use the user id returned by supabase.auth.signUp
          firstname: formData.firstname,
          lastname: formData.lastname,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
        }]);
  
      if (insertError) {
        alert('Error inserting additional data: ' + insertError.message);
      } else {
        router.push('/account/new/freetime'); // Redirect to the login page
      }
    } else if (error) {
      // Handle error
      alert(error.message);
    }
  };  
  
  return (
    <div className="main-bg relative min-h-screen flex items-center justify-center text-buddha-200">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4">Create New Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="firstname" className="block text-sm font-medium text-buddha-200">
              First Name
            </label>
            <input 
              type="text"
              id="firstname"
              name="firstname"
              className="mt-1 p-2 w-full border border-buddha-950 rounded-md text-buddha-950"
              placeholder="Enter your first name"
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="lastname" className="block text-sm font-medium text-buddha-200">
              Last Name
            </label>
            <input
              type="text"
              id="lastname"
              name="lastname"
              className="mt-1 p-2 w-full border border-buddha-950 rounded-md text-buddha-950"
              placeholder="Enter your last name"
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="phone" className="block text-sm font-medium text-buddha-200">
              Phone
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              className="mt-1 p-2 w-full border border-buddha-950 rounded-md text-buddha-950"
              placeholder="Enter your phone number"
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-buddha-200">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 p-2 w-full border border-buddha-950 rounded-md text-buddha-950"
              placeholder="Enter your email"
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-buddha-200">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="mt-1 p-2 w-full border border-buddha-950 rounded-md text-buddha-950"
              placeholder="Enter your password"
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-buddha-500 text-buddha-950 py-2 px-4 rounded hover:bg-buddha-50 focus:outline-none focus:ring focus:ring-blue-200"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewAccount;

function insertUser(formData: { firstname: string; lastname: string; phone: string; email: string; password: string; }) {
  throw new Error('Function not implemented.');
}
function from(arg0: string) {
  throw new Error('Function not implemented.');
}

