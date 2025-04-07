'use client';

import SpiralMotion from '@/components/SpiralMotion';

export default function SpiralPage() {
  return (
    <main className="min-h-screen p-8 bg-black text-white">
      <h1 className="text-3xl font-bold mb-8">Upward Spiral Motion</h1>
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900 rounded-lg shadow-lg p-6 mb-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Spiral Motion Simulation</h2>
          <p className="text-gray-300 mb-4">
            This simulation demonstrates an object moving in an upward spiral pattern.
            The object follows a circular path in the horizontal plane while moving upward.
          </p>
          <SpiralMotion />
        </div>
        
        <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          <div className="text-gray-300">
            <p className="mb-4">
              The spiral motion is created by combining:
            </p>
            <ul className="list-disc list-inside mb-4">
              <li>Circular motion in the horizontal plane (x-z plane)</li>
              <li>Linear upward motion along the y-axis</li>
              <li>Time-based animation using Three.js and React Three Fiber</li>
            </ul>
            <p>
              The position is calculated using parametric equations:
            </p>
            <pre className="bg-gray-800 p-4 rounded-lg mt-2 overflow-x-auto">
              <code>
                x = radius * cos(time)<br />
                z = radius * sin(time)<br />
                y = (time * height) % height
              </code>
            </pre>
          </div>
        </div>
      </div>
    </main>
  );
} 