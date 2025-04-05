'use client';

import TennisBallSimulation from '@/components/TennisBallSimulation';

export default function TennisBallPage() {
  return (
    <main className="min-h-screen p-8 bg-black text-white">
      <h1 className="text-3xl font-bold mb-8">Tennis Ball Physics Simulation</h1>
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900 rounded-lg shadow-lg p-6 mb-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Physics Simulation</h2>
          <p className="text-gray-300 mb-4">
            This simulation demonstrates the physics of a tennis ball dropping on concrete.
            The simulation uses:
          </p>
          <ul className="list-disc list-inside text-gray-300 mb-4">
            <li>Realistic gravity (9.82 m/s²)</li>
            <li>Proper tennis ball mass (57g) and radius (3.3cm)</li>
            <li>Concrete surface properties (friction and elasticity)</li>
            <li>3D visualization with Three.js and React Three Fiber</li>
            <li>Physics calculations with Cannon.js</li>
          </ul>
          <TennisBallSimulation />
        </div>
        
        <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Physics Parameters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Tennis Ball</h3>
              <ul className="list-disc list-inside text-gray-300">
                <li>Mass: 57g (0.057 kg)</li>
                <li>Radius: 3.3cm (0.033 m)</li>
                <li>Friction: 0.3</li>
                <li>Restitution (bounciness): 0.7</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Concrete Surface</h3>
              <ul className="list-disc list-inside text-gray-300">
                <li>Friction: 0.3</li>
                <li>Restitution: 0.7</li>
                <li>Static: Yes (doesn't move)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 