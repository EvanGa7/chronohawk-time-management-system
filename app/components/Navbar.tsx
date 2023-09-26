'use client'
import React from "react";
import {Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button} from "@nextui-org/react";
import ChronoLogo from "./logo";


export default function App() {
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
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
          <Link href="/account/existing" className='text-buddha-200'>Login</Link>
        </NavbarItem>
        <NavbarItem>
          <Button as={Link} href="/account/new" variant="flat" className='text-buddha-800 bg-buddha-200'>
            Sign Up
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}

