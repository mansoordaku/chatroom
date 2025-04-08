'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
}

interface ParticleSystemProps {
  maxParticles: number;
  particleColor: string;
  particleLife: number;
  particleSpeed: number;
  emissionInterval: number;
}

function ParticleSystem({ 
  maxParticles, 
  particleColor, 
  particleLife,
  particleSpeed,
  emissionInterval 
}: ParticleSystemProps) {
  const EMISSION_BATCH = 50; // Number of particles per emission
  const SPREAD_RADIUS = 7;
  
  const particles = useRef<Particle[]>([]);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempMatrix = new THREE.Matrix4();
  const lastEmissionTime = useRef(0);
  
  // Initialize instanced mesh for particles
  const geometry = new THREE.SphereGeometry(0.1, 8, 8);
  const material = new THREE.MeshBasicMaterial({ color: particleColor });
  
  // Create new particle with random direction
  const createParticle = () => {
    const angle1 = Math.random() * Math.PI * 2; // Horizontal angle
    const angle2 = Math.random() * Math.PI * 2; // Vertical angle
    
    return {
      position: new THREE.Vector3(0, 0, 0),
      velocity: new THREE.Vector3(
        Math.cos(angle1) * Math.cos(angle2) * particleSpeed,
        Math.sin(angle2) * particleSpeed,
        Math.sin(angle1) * Math.cos(angle2) * particleSpeed
      ),
      life: particleLife
    };
  };
  
  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    
    // Update existing particles
    particles.current = particles.current
      .map(particle => ({
        ...particle,
        position: particle.position.add(particle.velocity.clone().multiplyScalar(delta)),
        life: particle.life - delta
      }))
      .filter(particle => particle.life > 0 && particle.position.length() <= SPREAD_RADIUS);
    
    // Check if it's time to emit new particles
    lastEmissionTime.current += delta;
    if (lastEmissionTime.current >= emissionInterval) {
      // Emit new batch of particles
      for (let i = 0; i < EMISSION_BATCH; i++) {
        if (particles.current.length < maxParticles) {
          particles.current.push(createParticle());
        }
      }
      lastEmissionTime.current = 0; // Reset timer
    }
    
    // Update instanced mesh
    particles.current.forEach((particle, i) => {
      tempMatrix.setPosition(particle.position);
      mesh.setMatrixAt(i, tempMatrix);
    });
    
    mesh.count = particles.current.length;
    mesh.instanceMatrix.needsUpdate = true;
  });
  
  return (
    <instancedMesh ref={meshRef} args={[geometry, material, maxParticles]} />
  );
}

function AxisLabels() {
  return (
    <>
      {/* X-axis label */}
      <Html position={[8, 0, 0]}>
        <div className="text-white">X</div>
      </Html>
      {/* Y-axis label */}
      <Html position={[0, 8, 0]}>
        <div className="text-white">Y</div>
      </Html>
      {/* Z-axis label */}
      <Html position={[0, 0, 8]}>
        <div className="text-white">Z</div>
      </Html>
    </>
  );
}

function GridAndAxes() {
  return (
    <>
      {/* Grid */}
      <gridHelper args={[20, 20]} />
      {/* Axes */}
      <axesHelper args={[8]} />
      <AxisLabels />
    </>
  );
}

function Controls({ 
  particleCount, 
  setParticleCount, 
  particleColor, 
  setParticleColor,
  particleLife,
  setParticleLife,
  particleSpeed,
  setParticleSpeed,
  emissionInterval,
  setEmissionInterval
}: { 
  particleCount: number;
  setParticleCount: (count: number) => void;
  particleColor: string;
  setParticleColor: (color: string) => void;
  particleLife: number;
  setParticleLife: (life: number) => void;
  particleSpeed: number;
  setParticleSpeed: (speed: number) => void;
  emissionInterval: number;
  setEmissionInterval: (interval: number) => void;
}) {
  return (
    <div className="absolute top-4 right-4 bg-gray-800 p-4 rounded-lg shadow-lg w-64">
      <div className="mb-4">
        <label className="block text-white text-sm mb-2">
          Particle Count: {particleCount}
        </label>
        <input
          type="range"
          min="100"
          max="2000"
          value={particleCount}
          onChange={(e) => setParticleCount(Number(e.target.value))}
          className="w-full"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-white text-sm mb-2">
          Particle Lifetime: {particleLife.toFixed(1)}s
        </label>
        <input
          type="range"
          min="0.5"
          max="5"
          step="0.1"
          value={particleLife}
          onChange={(e) => setParticleLife(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block text-white text-sm mb-2">
          Particle Speed: {particleSpeed.toFixed(1)}
        </label>
        <input
          type="range"
          min="0.5"
          max="5"
          step="0.1"
          value={particleSpeed}
          onChange={(e) => setParticleSpeed(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block text-white text-sm mb-2">
          Emission Interval: {emissionInterval.toFixed(1)}s
        </label>
        <input
          type="range"
          min="0.1"
          max="5"
          step="0.1"
          value={emissionInterval}
          onChange={(e) => setEmissionInterval(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-white text-sm mb-2">
          Particle Color
        </label>
        <input
          type="color"
          value={particleColor}
          onChange={(e) => setParticleColor(e.target.value)}
          className="w-full h-8 cursor-pointer"
        />
      </div>
    </div>
  );
}

export default function ParticleEmitterScene() {
  const [particleCount, setParticleCount] = useState(1000);
  const [particleColor, setParticleColor] = useState('#ff0000');
  const [particleLife, setParticleLife] = useState(2.0);
  const [particleSpeed, setParticleSpeed] = useState(2.0);
  const [emissionInterval, setEmissionInterval] = useState(1.0);

  return (
    <div className="w-[115%] h-[600px] relative">
      <Canvas
        camera={{ position: [10, 5, 10], fov: 60 }}
        style={{ background: '#000000' }}
      >
        <ParticleSystem 
          maxParticles={particleCount} 
          particleColor={particleColor}
          particleLife={particleLife}
          particleSpeed={particleSpeed}
          emissionInterval={emissionInterval}
        />
        <GridAndAxes />
        <OrbitControls />
        <ambientLight intensity={0.5} />
      </Canvas>
      <Controls 
        particleCount={particleCount}
        setParticleCount={setParticleCount}
        particleColor={particleColor}
        setParticleColor={setParticleColor}
        particleLife={particleLife}
        setParticleLife={setParticleLife}
        particleSpeed={particleSpeed}
        setParticleSpeed={setParticleSpeed}
        emissionInterval={emissionInterval}
        setEmissionInterval={setEmissionInterval}
      />
    </div>
  );
} 