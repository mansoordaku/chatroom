'use client';

import { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, Points, PointMaterial, Effects } from '@react-three/drei';
import * as THREE from 'three';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

// Extend Three.js with UnrealBloomPass
extend({ UnrealBloomPass });

interface SpiralProps {
  isRunning: boolean;
  particleCount: number;
  spiralRadius: number;
  verticalSpeed: number;
  rotationSpeed: number;
  color: string;
  glowIntensity: number;
  particleSize: number;
  noiseAmount: number;
  maxHeight: number;
}

function EnergySpiralEffect({
  isRunning,
  particleCount,
  spiralRadius,
  verticalSpeed,
  rotationSpeed,
  color,
  glowIntensity,
  particleSize,
  noiseAmount,
  maxHeight
}: SpiralProps) {
  const points = useRef<THREE.Points>(null);
  const timeRef = useRef(0);
  const heightRef = useRef(0);
  const directionRef = useRef(1);

  // Create geometry once and reuse
  const geometry = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);
    
    const threeColor = new THREE.Color(color);
    
    // Create initial spiral shape
    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      const angle = t * Math.PI * 8; // 4 complete rotations
      const radius = spiralRadius * (1 + Math.sin(t * Math.PI * 2) * 0.2);
      const height = t * maxHeight; // Use maxHeight parameter
      
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      
      // Larger particles at the front of the spiral
      sizes[i] = particleSize;
      
      // Add color variation
      colors[i * 3] = threeColor.r;
      colors[i * 3 + 1] = threeColor.g;
      colors[i * 3 + 2] = threeColor.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geometry;
  }, [particleCount, spiralRadius, particleSize, color, maxHeight]);

  useFrame((state, delta) => {
    if (!isRunning || !points.current) return;

    timeRef.current += delta * rotationSpeed;
    
    // Update vertical position with rise and fall
    if (directionRef.current > 0) {
      heightRef.current += delta * verticalSpeed;
      if (heightRef.current >= maxHeight) {
        directionRef.current = -1;
      }
    } else {
      heightRef.current -= delta * verticalSpeed;
      if (heightRef.current <= 0) {
        directionRef.current = 1;
      }
    }

    const positions = points.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      const baseAngle = t * Math.PI * 8 + timeRef.current;
      const radius = spiralRadius * (1 + Math.sin(timeRef.current + t * Math.PI * 2) * 0.2);
      const verticalOffset = heightRef.current;
      
      // Add some organic movement
      const noise = {
        x: (Math.random() - 0.5) * noiseAmount * radius,
        y: (Math.random() - 0.5) * noiseAmount,
        z: (Math.random() - 0.5) * noiseAmount * radius
      };

      positions[i * 3] = Math.cos(baseAngle) * radius + noise.x;
      positions[i * 3 + 1] = (t * maxHeight + verticalOffset) % maxHeight + noise.y;
      positions[i * 3 + 2] = Math.sin(baseAngle) * radius + noise.z;
    }

    points.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <Points ref={points} geometry={geometry}>
      <pointsMaterial
        size={particleSize * 3}
        vertexColors
        transparent
        opacity={1}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation={true}
      />
    </Points>
  );
}

function DebugObjects() {
  return (
    <>
      {/* Grid helper */}
      <gridHelper args={[10, 10]} position={[0, 0, 0]} />
      
      {/* Axes helper */}
      <axesHelper args={[5]} />
      
      {/* Center reference sphere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="white" />
      </mesh>
    </>
  );
}

export default function SpiralMotion() {
  const [isRunning, setIsRunning] = useState(false);
  const [settings, setSettings] = useState({
    particleCount: 2000,
    spiralRadius: 3,
    verticalSpeed: 0.5,
    rotationSpeed: 1,
    color: '#ff6600',
    glowIntensity: 2,
    particleSize: 0.3,
    noiseAmount: 0.05,
    maxHeight: 5
  });

  // Stop animation when changing particle count
  const handleParticleCountChange = (value: number) => {
    setIsRunning(false);
    setSettings(s => ({ ...s, particleCount: value }));
  };

  const SliderControl = ({ value, onChange, label, min, max, step = 0.01 }: {
    value: number;
    onChange: (value: number) => void;
    label: string;
    min: number;
    max: number;
    step?: number;
  }) => (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between">
        <label className="text-sm text-gray-300">{label}</label>
        <span className="text-sm text-gray-400">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
        disabled={isRunning && label === "Particle Count"}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full h-[600px] bg-black rounded-lg overflow-hidden">
        <Canvas 
          camera={{ 
            position: [10, 5, 10],
            fov: 60,
            near: 0.1,
            far: 1000
          }}
          dpr={[1, 2]}
        >
          <color attach="background" args={['#000000']} />
          <EnergySpiralEffect
            isRunning={isRunning}
            {...settings}
          />
          <DebugObjects />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxDistance={20}
            minDistance={1}
          />
          <Effects>
            <unrealBloomPass threshold={0.1} strength={settings.glowIntensity} radius={1} />
          </Effects>
          
          {/* Basic lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
        </Canvas>
      </div>
      
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="text-sm text-gray-300 mb-4">
          Camera Controls:
          <ul className="list-disc list-inside mt-2">
            <li>Left mouse button: Rotate view</li>
            <li>Right mouse button: Pan</li>
            <li>Mouse wheel: Zoom in/out</li>
          </ul>
        </div>
        
        <div className="flex flex-col gap-6">
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-8 py-3 rounded-lg font-semibold text-lg ${
                isRunning 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {isRunning ? 'Stop' : 'Start'} Spiral
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SliderControl
              value={settings.particleCount}
              onChange={handleParticleCountChange}
              label="Particle Count"
              min={100}
              max={2000}
              step={100}
            />
            <SliderControl
              value={settings.spiralRadius}
              onChange={(value) => setSettings(s => ({ ...s, spiralRadius: value }))}
              label="Spiral Radius"
              min={0.5}
              max={2}
            />
            <SliderControl
              value={settings.verticalSpeed}
              onChange={(value) => setSettings(s => ({ ...s, verticalSpeed: value }))}
              label="Vertical Speed"
              min={0.1}
              max={2}
            />
            <SliderControl
              value={settings.rotationSpeed}
              onChange={(value) => setSettings(s => ({ ...s, rotationSpeed: value }))}
              label="Rotation Speed"
              min={0.5}
              max={5}
            />
            <SliderControl
              value={settings.glowIntensity}
              onChange={(value) => setSettings(s => ({ ...s, glowIntensity: value }))}
              label="Glow Intensity"
              min={0}
              max={3}
            />
            <SliderControl
              value={settings.particleSize}
              onChange={(value) => setSettings(s => ({ ...s, particleSize: value }))}
              label="Particle Size"
              min={0.01}
              max={0.2}
            />
            <SliderControl
              value={settings.noiseAmount}
              onChange={(value) => setSettings(s => ({ ...s, noiseAmount: value }))}
              label="Chaos Amount"
              min={0}
              max={0.1}
            />
            <SliderControl
              value={settings.maxHeight}
              onChange={(value) => setSettings(s => ({ ...s, maxHeight: value }))}
              label="Maximum Height"
              min={2}
              max={10}
              step={0.5}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-300">Color</label>
              <input
                type="color"
                value={settings.color}
                onChange={(e) => setSettings(s => ({ ...s, color: e.target.value }))}
                className="w-full h-10 rounded"
                disabled={isRunning}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 