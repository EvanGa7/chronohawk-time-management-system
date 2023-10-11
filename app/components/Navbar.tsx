'use client'
import React, { useState, useEffect } from 'react';
import {Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button} from "@nextui-org/react";
import ChronoLogo from "./logo";
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'; // Import useRouter hook
import {Checkbox} from "@nextui-org/react";


const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// utils/auth.ts


export default function App() {
  const [userName, setUserName] = useState(null);

  // useEffect(() => {
  //   // Function to fetch user name
  //   const fetchUserName = async () => {
  //     const user = supabase.auth.getUser();
  //     if (user) {
  //       const userid = user.id;
  //       const { data, error } = await supabase
  //         .from('users')
  //         .select('firstname, lastname')
  //         .eq('userid', userid);
  
  //         const userFirstName = data.firstname;
  //         const userLastName = data.lastname;
  //         setUserName(userFirstName + ' ' + userLastName);
  //     }
  //   };

  //   fetchUserName(); // Fetch user name on initial load

  //   // You can refresh the user name periodically (e.g., every few hours) using a timer if needed.
  //   const refreshInterval = setInterval(() => {
  //     fetchUserName();
  //   }, 3 * 60 * 60 * 1000); // Refresh every 3 hours (adjust as needed)

  //   // Cleanup the interval to avoid memory leaks
  //   return () => clearInterval(refreshInterval);
  // }, []);



  return (
    <Navbar shouldHideOnScroll className='bg-buddha-950'>
      <NavbarBrand>
        <ChronoLogo />
        <p className="text-buddha-200" style={{ fontSize: '25px', lineHeight: '14px', margin: '0', padding: '10px'}}>ChronoHawk</p>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link color="foreground" href="/" className='text-buddha-200'>
            Home
          </Link>
        </NavbarItem>
        <NavbarItem isActive>
          <Link href="/calendar" aria-current="page" className='text-buddha-500'>
            Calendar
          </Link>
        </NavbarItem>
        <NavbarItem >
          <Link color="foreground" href="/account" className='text-buddha-200'>
            Account
          </Link>
        </NavbarItem>
        <NavbarItem >
          <Link color="foreground" href="/account/new/freetime" className='text-buddha-200'>
            FreeTime
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
      {userName == null ? (
        <>
        <NavbarItem className="hidden lg:flex">
          <Link href="/account/existing" className='text-buddha-200'>Login</Link>
        </NavbarItem>
        <NavbarItem>
          <Button as={Link} href="/account/new" variant="flat" className='text-buddha-800 bg-buddha-200'>
            Sign Up
          </Button>
        </NavbarItem>
        </>
      ):(
        <>
          <NavbarItem >
            <Button className='text-buddha-950 bg-buddha-500' as={Link} href="/account">Welcome, {userName}</Button>
        </NavbarItem>
        </>
      )}
      </NavbarContent>
    </Navbar>
  );
}

