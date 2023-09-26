'use client'
import Image from 'next/image'
import Link from 'next/link'
import * as React from "react";

// 1. import `NextUIProvider` component
import { NextUIProvider } from "@nextui-org/react";

export default function Home() {
  return (
    <NextUIProvider>
      <main className="main-bg relative min-h-screen p-8 text-buddha-200">
        <section id="welcome" className="text-center py-16">
          <h2 className="text-buddha-200 text-4xl font-bold mb-4">Welcome to Chronohawk</h2>
          <p className="text-lg text-gray-600">Here you can add tasks, set deadlines, and prioritize your tasks.</p>
          <p className="text-lg text-gray-600">Click on a task to see more details.</p>
        </section>

        <section id="about" className="text-center py-16 bg-white">
          <h2 className="text-buddha-200 text-4xl font-bold mb-4">About</h2>
          <p className="text-lg text-gray-600">Chronohawk is a time management application that helps you keep track of your tasks and deadlines.</p>
        </section>

        <section id="features" className="text-center py-16">
          <h2 className="text-buddha-200 text-4xl font-bold mb-8">Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className= "text-buddha-200 text-2xl font-semibold mb-4">Task Management</h3>
              <p className="text-gray-600">Organize your tasks and prioritize them effectively.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-buddha-200 text-2xl font-semibold mb-4">Calendar Integration</h3>
              <p className="text-gray-600">Plan your schedule and keep track of important dates.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-buddha-200 text-2xl font-semibold mb-4">Daily Planning</h3>
              <p className="text-gray-600">Create a daily plan to achieve your goals efficiently.</p>
            </div>
          </div>
        </section>
      </main>
    </NextUIProvider>
  );
}
