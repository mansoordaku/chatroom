'use client';

import Scene3D from '@/components/Scene3D';

export default function ThreeDPage() {
  return (
    <main className="min-h-screen p-8 bg-black text-white">
      <h1 className="text-3xl font-bold mb-8">3D Graphics Demo</h1>
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900 rounded-lg shadow-lg p-6 mb-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Interactive 3D Scene</h2>
          <p className="text-gray-300 mb-4">
            This scene demonstrates basic 3D graphics using React Three Fiber.
            You can:
          </p>
          <ul className="list-disc list-inside text-gray-300 mb-4">
            <li>Rotate the view by dragging</li>
            <li>Zoom in/out using the scroll wheel</li>
            <li>Hover over objects to see them change color</li>
          </ul>
          <Scene3D />
        </div>
      </div>
    </main>
  );
} 