import ParticleEmitter from '@/components/ParticleEmitter';

export default function EmitterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-gray-900">
      <h1 className="text-2xl font-bold text-white mb-4">3D Particle Emitter</h1>
      <div className="w-full max-w-[1200px]">
        <ParticleEmitter />
      </div>
    </main>
  );
} 