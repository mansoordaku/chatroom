'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Plane } from '@react-three/drei';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

// Physics world setup
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0)
});

function TennisBall({ friction, restitution, initialHeight, initialVelocity }: { 
  friction: number;
  restitution: number;
  initialHeight: number;
  initialVelocity: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [position, setPosition] = useState([0, initialHeight, 0]);
  const [rotation, setRotation] = useState([0, 0, 0]);

  // Create materials with current parameters
  useEffect(() => {
    // Update materials
    const ballMaterial = new CANNON.Material({
      friction,
      restitution
    });

    const groundMaterial = new CANNON.Material({
      friction,
      restitution
    });

    // Update ground body
    groundBody.material = groundMaterial;

    // Update ball body
    ballBody.material = ballMaterial;

    // Update contact material
    const ballGroundContactMaterial = new CANNON.ContactMaterial(
      ballMaterial,
      groundMaterial,
      {
        friction,
        restitution
      }
    );

    // Remove old contact materials
    world.contactmaterials.length = 0;
    world.addContactMaterial(ballGroundContactMaterial);

  }, [friction, restitution]);
  
  // Update physics and position
  useFrame((state, delta) => {
    // Step the physics world
    world.step(1/60);
    
    // Update ball position and rotation
    if (meshRef.current) {
      meshRef.current.position.copy(ballBody.position as any);
      meshRef.current.quaternion.copy(ballBody.quaternion as any);
    }
    
    // Store position and rotation for display
    setPosition([ballBody.position.x, ballBody.position.y, ballBody.position.z]);
    setRotation([
      ballBody.quaternion.x,
      ballBody.quaternion.y,
      ballBody.quaternion.z,
      ballBody.quaternion.w
    ]);
  });
  
  return (
    <>
      <Sphere ref={meshRef} args={[0.033, 32, 32]}>
        <meshStandardMaterial color="#ffff00" />
      </Sphere>
      <Plane args={[10, 10]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <meshStandardMaterial color="#333333" />
      </Plane>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <OrbitControls />
    </>
  );
}

// Create ground body
const groundBody = new CANNON.Body({
  type: CANNON.Body.STATIC,
  shape: new CANNON.Plane(),
});
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
world.addBody(groundBody);

// Create ball body
const ballBody = new CANNON.Body({
  mass: 0.057, // Tennis ball mass in kg
  shape: new CANNON.Sphere(0.033), // Tennis ball radius in meters
});

// Add ball to world
world.addBody(ballBody);

export default function TennisBallSimulation() {
  const [isDropped, setIsDropped] = useState(false);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [friction, setFriction] = useState(0.3);
  const [restitution, setRestitution] = useState(0.7);
  const [initialHeight, setInitialHeight] = useState(5);
  const [initialVelocity, setInitialVelocity] = useState(0);
  
  const startSimulation = () => {
    setIsSimulationRunning(true);
    setIsDropped(true);
    ballBody.position.set(0, initialHeight, 0);
    ballBody.velocity.set(0, initialVelocity, 0);
    ballBody.angularVelocity.set(0, 0, 0);
  };
  
  const resetSimulation = () => {
    setIsSimulationRunning(false);
    setIsDropped(false);
    ballBody.position.set(0, initialHeight, 0);
    ballBody.velocity.set(0, 0, 0);
    ballBody.angularVelocity.set(0, 0, 0);
  };
  
  interface SliderProps {
    value: number;
    onChange: (value: number) => void;
    label: string;
    min: number;
    max: number;
    step?: number;
  }

  const SliderControl = ({ value, onChange, label, min, max, step = 0.1 }: SliderProps) => (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between">
        <label className="text-sm text-gray-300">{label}</label>
        <span className="text-sm text-gray-400">{value.toFixed(1)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
        disabled={isSimulationRunning}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full h-[400px] bg-gray-900 rounded-lg overflow-hidden">
        <Canvas camera={{ position: [0, 2, 5] }}>
          <TennisBall 
            friction={friction}
            restitution={restitution}
            initialHeight={initialHeight}
            initialVelocity={initialVelocity}
          />
        </Canvas>
      </div>
      <div className="bg-gray-900 rounded-lg p-6">
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SliderControl
              value={friction}
              onChange={setFriction}
              label="Friction (0-1)"
              min={0}
              max={1}
            />
            <SliderControl
              value={restitution}
              onChange={setRestitution}
              label="Restitution (Bounciness) (0-1)"
              min={0}
              max={1}
            />
            <SliderControl
              value={initialHeight}
              onChange={setInitialHeight}
              label="Initial Height (m)"
              min={0.1}
              max={10}
            />
            <SliderControl
              value={initialVelocity}
              onChange={setInitialVelocity}
              label="Initial Velocity (m/s)"
              min={0}
              max={20}
            />
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="flex justify-center gap-4">
              <button
                onClick={startSimulation}
                disabled={isSimulationRunning}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-500 font-semibold"
              >
                Start Simulation
              </button>
              <button
                onClick={resetSimulation}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
              >
                Reset
              </button>
            </div>
            <div className="text-sm text-gray-400">
              {isSimulationRunning ? "Simulation is running..." : "Adjust parameters and click 'Start Simulation' to begin"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 