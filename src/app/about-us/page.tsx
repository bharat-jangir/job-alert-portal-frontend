'use client'
import React, { useState } from 'react';
import Header from '../../components/Header';

const funFacts = [
  'We update job listings in real-time so you never miss an opportunity!',
  'Our platform covers both government and private sector jobs.',
  'You can search for jobs by keyword, location, or type.',
  'We are committed to providing accurate and reliable information.',
  'Thousands of users trust Job Alert Web for their career updates.'
];

export default function AboutPage() {
  const [fact, setFact] = useState(funFacts[0]);

  const showRandomFact = () => {
    let newFact;
    do {
      newFact = funFacts[Math.floor(Math.random() * funFacts.length)];
    } while (newFact === fact && funFacts.length > 1);
    setFact(newFact);
  };

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto py-16 px-4">
        <h1 className="text-4xl font-bold mb-6 text-center">About Us</h1>
        <p className="text-lg mb-8 text-gray-700 text-center">
          Welcome to Job Alert Web – your trusted source for the latest job updates, admit cards, results, and answer keys. Our mission is to empower job seekers by providing timely, accurate, and comprehensive information to help you achieve your career goals.
        </p>
        <section className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-700">
            We strive to bridge the gap between job opportunities and aspirants by delivering up-to-date notifications and resources. Whether you are a fresh graduate or an experienced professional, our platform is designed to support your journey every step of the way.
          </p>
        </section>
        <section className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Why Choose Us?</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Real-time job alerts and updates</li>
            <li>Comprehensive coverage of government and private sector jobs</li>
            <li>Easy access to admit cards, results, and answer keys</li>
            <li>User-friendly interface for seamless navigation</li>
            <li>Dedicated to accuracy and reliability</li>
          </ul>
        </section>
        <section className="bg-blue-50 rounded-lg shadow p-6 flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-2">Did You Know?</h2>
          <p className="text-blue-700 mb-4 text-center">{fact}</p>
          <button
            onClick={showRandomFact}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Show Another Fact
          </button>
        </section>
      </main>
    </>
  );
} 