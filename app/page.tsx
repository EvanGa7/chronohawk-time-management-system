'use client'
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import { NextUIProvider, Button } from '@nextui-org/react';

export default function Home() {
  return (
    <NextUIProvider>
      <main className="main-bg relative min-h-screen p-8 text-buddha-200">
        <section id="welcome" className="text-center py-16 space-y-8">
          <h1 className="text-buddha-200 text-5xl font-extrabold mb-4">Chronohawk</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Your ultimate time management system for students. Plan, prioritize, and succeed.</p>
          <br />
          <Link href="./account/new">
              <Button size="lg" variant='shadow' className='bg-buddha-500 text-buddha-950'>Get Started</Button>
          </Link>
        </section>

        <section id="about" className="text-center py-16 bg-buddha-200 space-y-8">
          <h2 className="text-buddha-950 text-4xl font-bold mb-4">About Us</h2>
          <p className="text-lg text-buddha-950 max-w-3xl mx-auto">Our mission is to help students manage their time effectively. We understand the challenges of juggling assignments, projects, and exams. Chronohawk is designed to help you plan ahead, avoid last-minute cramming, and achieve academic success.</p>
        </section>

        <section id="features" className="text-center py-16 space-y-8">
          <h2 className="text-buddha-200 text-4xl font-bold mb-8">Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
            {featureData.map((feature, idx) => (
              <FeatureCard key={idx} title={feature.title} description={feature.description} />
            ))}
          </div>
        </section>
      </main>
    </NextUIProvider>
  );
}

const featureData = [
  {
    title: 'Task Management',
    description: 'Manage tasks with ease. Add, edit, and prioritize tasks. View all task details at a glance.',
  },
  {
    title: 'Calendar Integration',
    description: 'Visualize your month ahead. Sync tasks with dates and never miss a deadline.',
  },
  {
    title: 'Daily Planning',
    description: 'Plan each day for success. Allocate time effectively and study smarter, not harder.',
  },
];

const FeatureCard = ({ title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
    <h3 className="text-buddha-200 text-2xl font-semibold mb-4">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);
