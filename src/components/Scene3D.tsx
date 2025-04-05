'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Sphere } from '@react-three/drei';
import { useState } from 'react';

function Scene() {
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      <Box 
        position={[-2, 0, 0]} 
        args={[1, 1, 1]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
      </Box>
      
      <Sphere 
        position={[2, 0, 0]} 
        args={[1, 32, 32]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial color={hovered ? 'lightblue' : 'blue'} />
      </Sphere>
      
      <OrbitControls />
    </>
  );
}

export default function Scene3D() {
  return (
    <div className="w-full h-[500px] bg-gray-900 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <Scene />
      </Canvas>
    </div>
  );
} 