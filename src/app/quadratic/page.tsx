'use client';

import { useState } from 'react';
import QuadraticGraph from '@/components/QuadraticGraph';

export default function QuadraticPage() {
  const [coefficients, setCoefficients] = useState({
    a: 1,
    b: 0,
    c: 0
  });

  return (
    <main className="min-h-screen p-8 bg-black text-white">
      <h1 className="text-3xl font-bold mb-8">Quadratic Equation Graph</h1>
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900 rounded-lg shadow-lg p-6 mb-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Equation: ax² + bx + c</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">a (x² coefficient)</label>
              <input
                type="number"
                value={coefficients.a}
                onChange={(e) => setCoefficients(prev => ({ ...prev, a: parseFloat(e.target.value) }))}
                className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">b (x coefficient)</label>
              <input
                type="number"
                value={coefficients.b}
                onChange={(e) => setCoefficients(prev => ({ ...prev, b: parseFloat(e.target.value) }))}
                className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">c (constant)</label>
              <input
                type="number"
                value={coefficients.c}
                onChange={(e) => setCoefficients(prev => ({ ...prev, c: parseFloat(e.target.value) }))}
                className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                step="0.1"
              />
            </div>
          </div>
        </div>
        <QuadraticGraph coefficients={coefficients} />
      </div>
    </main>
  );
} 