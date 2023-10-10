// 'use client'
// import Image from 'next/image'
// import Link from 'next/link'
// import * as React from "react";

// // 1. import `NextUIProvider` component
// import { NextUIProvider } from "@nextui-org/react";

// export default function Home() {
//   return (
//     <NextUIProvider>
//       <main className="main-bg relative min-h-screen p-8 text-buddha-200">
//         <section id="welcome" className="text-center py-16">
//           <h2 className="text-buddha-200 text-4xl font-bold mb-4">Welcome to Chronohawk</h2>
//           <p className="text-lg text-gray-600">Here you can add tasks, set deadlines, and prioritize your tasks.</p>
//           <p className="text-lg text-gray-600">Click on a task to see more details.</p>
//         </section>

//         <section id="about" className="text-center py-16 bg-white">
//           <h2 className="text-buddha-200 text-4xl font-bold mb-4">About Us</h2>
//           <p className="text-lg text-gray-600">This project was to create a time management system for students that 
//           would be open to everyone. We personally have had issues planning out our schedules and end up doing the 
//           assignment the night before. That is why we created a system to calculate the amount of time a day the user 
//           has to study before the due date. This will help prevent students from doing assignments the night before. 
//           It will also help students to study and prepare for other tasks that are required for school. We hope this can be 
//           used by as many students as possible, so more students won’t have to do the hw the day before it is due.
//           </p>
//         </section>
//         <section id="features" className="text-center py-16">
//           <h2 className="text-buddha-200 text-4xl font-bold mb-8">Features</h2>
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
//             <div className="bg-white p-6 rounded-lg shadow-md">
//               <h3 className= "text-buddha-200 text-2xl font-semibold mb-4">Task Management</h3>
//               <p className="text-gray-600">WIth our advanced techniques, we were able to create a way to manage tasks 
//               that will be focused on your experience with the focus on making it simple. Tasks can be found at the bottom 
//               of the calendar. You can add a task buy clicking add task or selecting a day on the calendar. Also, 
//               if a task needs to be edited it can be edited within the list of tasks. All of the task information is 
//               listed within the list, so that you know the exact information of the task. The task even shows up on the 
//               calendar making it easy to see when tasks’ due dates are.
//               </p>
//             </div>
//             <div className="bg-white p-6 rounded-lg shadow-md">
//               <h3 className="text-buddha-200 text-2xl font-semibold mb-4">Calendar Integration</h3>
//               <p className="text-gray-600">The Calendar is beautifully integrated to make the ultimate user experience. 
//               With the intention to make the user experience simple and easy to understand so you do not need to take 
//               long to get used to the system. Also, with our interactive tasks lists, you can view all the tasks and add or 
//               delete them easily. It also allows you to see all the information on one page so you do not have to switch 
//               between pages, making it easier to use.
//               </p>
//             </div>
//             <div className="bg-white p-6 rounded-lg shadow-md">
//               <h3 className="text-buddha-200 text-2xl font-semibold mb-4">Daily Planning</h3>
//               <p className="text-gray-600">This website offers a plethora of opportunities to plan your month. 
//               It allows you to plan out your studying and helps you plan out the time you have so that you are not 
//               surprised when a task due date comes up. Using specially formulated algorithms, we have created a way 
//               for you to equally space the work out, so you can be properly prepared for the task. Also, the colorful 
//               and interactive interface makes the experience simple and easy to follow.
//               </p>
//             </div>
//           </div>
//         </section>
//       </main>
//     </NextUIProvider>
//   );
// }

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
