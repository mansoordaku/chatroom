'use client';

import { useRef, useState, useEffect } from 'react';
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
  isRunning: boolean;
  emitterPosition: number;
  setEmitterPosition: (position: number) => void;
}

function ParticleSystem({ 
  maxParticles, 
  particleColor, 
  particleLife,
  particleSpeed,
  emissionInterval,
  isRunning,
  emitterPosition,
  setEmitterPosition
}: ParticleSystemProps) {
  const EMISSION_BATCH = 50; // Number of particles per emission
  const SPREAD_RADIUS = 7;
  const EMITTER_RANGE = 8; // Emitter moves between -8 and +8 on Y axis
  const EMITTER_SPEED = 1; // Units per second
  
  const particles = useRef<Particle[]>([]);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempMatrix = new THREE.Matrix4();
  const lastEmissionTime = useRef(0);
  const emitterDirection = useRef(1); // 1 for up, -1 for down
  
  // Log props changes
  useEffect(() => {
    console.log('ParticleSystem: isRunning changed to:', isRunning);
  }, [isRunning]);
  
  useEffect(() => {
    console.log('ParticleSystem: emitterPosition changed to:', emitterPosition);
  }, [emitterPosition]);
  
  // Initialize instanced mesh for particles
  const geometry = new THREE.SphereGeometry(0.1, 8, 8);
  const material = new THREE.MeshBasicMaterial({ color: particleColor });
  
  // Create new particle with random direction
  const createParticle = () => {
    const angle1 = Math.random() * Math.PI * 2; // Horizontal angle
    const angle2 = Math.random() * Math.PI * 2; // Vertical angle
    
    return {
      position: new THREE.Vector3(0, emitterPosition, 0),
      velocity: new THREE.Vector3(
        Math.cos(angle1) * Math.cos(angle2) * particleSpeed,
        Math.sin(angle2) * particleSpeed,
        Math.sin(angle1) * Math.cos(angle2) * particleSpeed
      ),
      life: particleLife
    };
  };
  
  // Only run the animation when isRunning is true
  if (isRunning) {
    useFrame((state, delta) => {
      const mesh = meshRef.current;
      if (!mesh) return;
      
      // Update emitter position when running
      const newPosition = emitterPosition + emitterDirection.current * EMITTER_SPEED * delta;
      
      // Reverse direction at limits
      if (newPosition >= EMITTER_RANGE) {
        console.log('Reached upper limit, setting position to:', EMITTER_RANGE);
        setEmitterPosition(EMITTER_RANGE);
        emitterDirection.current = -1;
      } else if (newPosition <= -EMITTER_RANGE) {
        console.log('Reached lower limit, setting position to:', -EMITTER_RANGE);
        setEmitterPosition(-EMITTER_RANGE);
        emitterDirection.current = 1;
      } else {
        setEmitterPosition(newPosition);
      }
      
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
  } else {
    // When not running, just update existing particles
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
      
      // Update instanced mesh
      particles.current.forEach((particle, i) => {
        tempMatrix.setPosition(particle.position);
        mesh.setMatrixAt(i, tempMatrix);
      });
      
      mesh.count = particles.current.length;
      mesh.instanceMatrix.needsUpdate = true;
    });
  }
  
  return (
    <>
      <instancedMesh ref={meshRef} args={[geometry, material, maxParticles]} />
      {/* Emitter visualization - made larger and more visible */}
      <mesh position={[0, emitterPosition, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="white" />
      </mesh>
    </>
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
  setEmissionInterval,
  isRunning,
  setIsRunning,
  setEmitterPosition
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
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  setEmitterPosition: (position: number) => void;
}) {
  // Log when Controls component receives new props
  useEffect(() => {
    console.log('Controls: isRunning prop changed to:', isRunning);
  }, [isRunning]);

  return (
    <div className="absolute bottom-4 left-4 bg-black/50 p-4 rounded-lg text-white space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Particle Count</label>
        <input
          type="range"
          min="100"
          max="5000"
          value={particleCount}
          onChange={(e) => setParticleCount(Number(e.target.value))}
          className="w-full"
          disabled={isRunning}
        />
        <div className="text-sm">{particleCount}</div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Color</label>
        <input
          type="color"
          value={particleColor}
          onChange={(e) => setParticleColor(e.target.value)}
          className="w-full h-8"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Lifetime (seconds)</label>
        <input
          type="range"
          min="0.5"
          max="5"
          step="0.1"
          value={particleLife}
          onChange={(e) => setParticleLife(Number(e.target.value))}
          className="w-full"
        />
        <div className="text-sm">{particleLife}s</div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Speed</label>
        <input
          type="range"
          min="0.1"
          max="5"
          step="0.1"
          value={particleSpeed}
          onChange={(e) => setParticleSpeed(Number(e.target.value))}
          className="w-full"
        />
        <div className="text-sm">{particleSpeed}</div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Emission Rate (particles/sec)</label>
        <input
          type="range"
          min="1"
          max="50"
          value={emissionInterval}
          onChange={(e) => setEmissionInterval(Number(e.target.value))}
          className="w-full"
        />
        <div className="text-sm">{emissionInterval}</div>
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`px-4 py-2 rounded ${
            isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isRunning ? 'Stop' : 'Start'}
        </button>
        <button
          onClick={() => setEmitterPosition(0)}
          className={`px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isRunning}
        >
          Reset Emitter
        </button>
      </div>
    </div>
  );
}

export default function ParticleEmitterScene() {
  const [isRunning, setIsRunning] = useState(false);
  const [particleCount, setParticleCount] = useState(1000);
  const [particleColor, setParticleColor] = useState('#ff0000');
  const [particleLifetime, setParticleLifetime] = useState(2.0);
  const [particleSpeed, setParticleSpeed] = useState(2.0);
  const [emissionRate, setEmissionRate] = useState(1.0);
  const [emitterPosition, setEmitterPosition] = useState(0);
  const emitterDirection = useRef(1);

  // Log state changes
  useEffect(() => {
    console.log('isRunning changed:', isRunning);
  }, [isRunning]);

  useEffect(() => {
    console.log('emitterPosition changed:', emitterPosition);
  }, [emitterPosition]);

  // Reset emitter position when animation is stopped
  useEffect(() => {
    console.log('Effect triggered, isRunning:', isRunning);
    // Only reset position when stopping, not when starting
    if (!isRunning) {
      console.log('Resetting emitter position to 0');
      setEmitterPosition(0);
      // Also reset the direction to ensure it starts moving up next time
      emitterDirection.current = 1;
    }
  }, [isRunning]);

  // Custom handler for the start/stop button
  const handleStartStop = () => {
    console.log('Button clicked, current isRunning:', isRunning);
    if (isRunning) {
      console.log('Stopping animation');
      // First set isRunning to false, which will trigger the useEffect to reset position
      setIsRunning(false);
    } else {
      console.log('Starting animation');
      setIsRunning(true);
    }
  };

  return (
    <div className="w-[115%] h-[600px] relative">
      <Canvas
        camera={{ position: [10, 5, 10], fov: 60 }}
        style={{ background: '#000000' }}
      >
        <ParticleSystem 
          maxParticles={particleCount} 
          particleColor={particleColor}
          particleLife={particleLifetime}
          particleSpeed={particleSpeed}
          emissionInterval={emissionRate}
          isRunning={isRunning}
          emitterPosition={emitterPosition}
          setEmitterPosition={setEmitterPosition}
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
        particleLife={particleLifetime}
        setParticleLife={setParticleLifetime}
        particleSpeed={particleSpeed}
        setParticleSpeed={setParticleSpeed}
        emissionInterval={emissionRate}
        setEmissionInterval={setEmissionRate}
        isRunning={isRunning}
        setIsRunning={handleStartStop}
        setEmitterPosition={setEmitterPosition}
      />
    </div>
  );
} 