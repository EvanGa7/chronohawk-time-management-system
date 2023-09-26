'use client'
import React, { useState } from 'react';
import { createClient} from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'; // Import useRouter hook

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const AccountPage = () => {
  const router = useRouter(); // Call the useRouter hook

  const [user, setUser] = useState({
    userid: '',
    firstname: '',
    lastname: '',
    email: '',
    phone: ''
  });
  
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (session && session.user) {
      // Fetch additional user info from the 'users' table in the database
      const { data, error } = await supabase
        .from('users')
        .select('firstname, lastname, phone')
        .eq('userid', session.user.id) // Add this line to filter by userid
        .single(); // Add this line to return a single object instead of an array
      if (error) {
        alert('Error fetching additional user data: ' + error.message);
        return;
      }
      if (data) {
        setUser({
          userid: session.user.id,
          firstname: data.firstname,
          lastname: data.lastname,
          email: session.user.email,
          phone: data.phone
        });
      }
    } else {
      // Redirect to home page
      router.push('/account/existing');
    }
  });

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      // Redirect to home page
      alert('You have been signed out successfully!');
      router.push('/');
    } else {
      alert("Error signing out: " + error.message);
    }
  };

  return (
    <div className="main-bg relative min-h-screen text-buddha-200 py-8">
      <div className="bg-white p-8 rounded shadow-md w-96 mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Account Information</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">UserID</label>
          <p className="text-lg text-gray-900">{user.userid}</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <p className="text-lg text-gray-900">{user.firstname}</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <p className="text-lg text-gray-900">{user.lastname}</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <p className="text-lg text-gray-900">{user.email}</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <p className="text-lg text-gray-900">{user.phone}</p>
        </div>
        <div className="flex justify-end">
          <button
            className="bg-buddha-500 text-buddha-950 py-2 px-4 rounded hover:bg-buddha-50 focus:outline-none focus:ring focus:ring-blue-200"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
