'use client';

import { useState, useRef } from 'react';
import AudioProcessor from '@/components/AudioProcessor';

export default function NoiseReductionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 20 * 1024 * 1024) { // 20MB limit
        setError('File size must be less than 20MB');
        setFile(null);
        return;
      }

      // Get file extension
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      const supportedExtensions = ['m4a', 'mp4', 'mp3', 'wav', 'ogg', 'webm'];

      // Check either MIME type or file extension
      const isSupported = 
        selectedFile.type.startsWith('audio/') ||
        (fileExtension && supportedExtensions.includes(fileExtension));

      if (!isSupported) {
        setError('Please select a supported audio file (M4A, MP3, WAV, OGG, or WEBM)');
        setFile(null);
        return;
      }

      setError('');
      setFile(selectedFile);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-black text-white">
      <h1 className="text-3xl font-bold mb-8">Audio Noise Reduction</h1>
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900 rounded-lg shadow-lg p-6 mb-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Upload Audio File</h2>
          <div className="mb-4">
            <input
              type="file"
              accept=".m4a,.mp4,.mp3,.wav,.ogg,.webm,audio/*"
              onChange={handleFileChange}
              className="w-full p-2 border rounded bg-gray-800 text-white border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
            />
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
          {file && (
            <div className="text-sm text-gray-300">
              <p>File: {file.name}</p>
              <p>Size: {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              <p>Type: {file.type || 'audio/m4a'}</p>
            </div>
          )}
        </div>
        {file && <AudioProcessor file={file} />}
      </div>
    </main>
  );
} 