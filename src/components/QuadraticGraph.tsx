'use client';

import { useEffect, useRef } from 'react';

interface Coefficients {
  a: number;
  b: number;
  c: number;
}

interface QuadraticGraphProps {
  coefficients: Coefficients;
}

export default function QuadraticGraph({ coefficients }: QuadraticGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const width = 800;
  const height = 600;
  const padding = 50;
  const scale = 50; // pixels per unit

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;

    // Vertical grid lines
    for (let x = 0; x <= width; x += scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let y = 0; y <= height; y += scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#FFFFFF'; // White color for axes
    ctx.lineWidth = 2;

    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    // Draw axis labels
    ctx.fillStyle = '#FFFFFF'; // White color for labels
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';

    // X-axis labels
    for (let x = -8; x <= 8; x++) {
      const screenX = width / 2 + x * scale;
      ctx.fillText(x.toString(), screenX, height / 2 + 20);
    }

    // Y-axis labels
    for (let y = -6; y <= 6; y++) {
      const screenY = height / 2 - y * scale;
      ctx.fillText(y.toString(), width / 2 - 20, screenY);
    }

    // Draw quadratic function
    ctx.strokeStyle = '#FFA500'; // Orange color for the graph
    ctx.lineWidth = 2;
    ctx.beginPath();

    const { a, b, c } = coefficients;
    const startX = -width / (2 * scale);
    const endX = width / (2 * scale);
    const step = 0.1;

    for (let x = startX; x <= endX; x += step) {
      const y = a * x * x + b * x + c;
      const screenX = width / 2 + x * scale;
      const screenY = height / 2 - y * scale;

      if (x === startX) {
        ctx.moveTo(screenX, screenY);
      } else {
        ctx.lineTo(screenX, screenY);
      }
    }

    ctx.stroke();
  }, [coefficients]);

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-700">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full border rounded border-gray-700"
      />
    </div>
  );
} 