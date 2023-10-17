import React from "react";

export function Footer() {
  return (
    <footer className="bg-buddha-950  text-buddha-200 p-4">
      <div className="container mx-auto">
        <div className="flex justify-center items-center">
          <p>&copy; {new Date().getFullYear()} ChronoHawk</p>
        </div>
        <br />
        <p className="flex justify-center items-center">🔥 Developed By Evan Gardner & Daniel lawrie 🔥</p>
      </div>
    </footer>
  );
};

export default Footer;

