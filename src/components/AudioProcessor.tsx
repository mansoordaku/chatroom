'use client';

import { useEffect, useRef, useState } from 'react';
import WaveSurfer, { WaveSurferEvents } from 'wavesurfer.js';
import RegionsPlugin, { Region } from 'wavesurfer.js/dist/plugins/regions';
import { audioBufferToWav } from '../utils/audioUtils';

// Define interfaces
interface NoiseRegion {
  start: number;
  end: number;
}

// Use the WaveSurfer type directly instead of extending it
type ExtendedWaveSurfer = WaveSurfer;

interface AudioProcessorProps {
  file: File;
}

// Add formatTime function
const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default function AudioProcessor() {
  const waveformRef = useRef<HTMLDivElement>(null);
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [noiseRegion, setNoiseRegion] = useState<NoiseRegion | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState<string>('');
  const [noiseReduction, setNoiseReduction] = useState(50);

  useEffect(() => {
    if (waveformRef.current && file) {
      // Cleanup previous instance
      if (wavesurfer) {
        wavesurfer.destroy();
      }

      // Create new instance
      const ws = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#4F46E5',
        progressColor: '#818CF8',
        cursorColor: '#C7D2FE',
        barWidth: 2,
        barRadius: 3,
        cursorWidth: 1,
        height: 200,
        barGap: 3,
        normalize: true,
        backend: 'WebAudio',
        minPxPerSec: 50 // Improve zoom level
      });

      // Initialize regions plugin
      const regions = RegionsPlugin.create();
      ws.registerPlugin(regions);

      // Add event listeners
      ws.on('play', () => setIsPlaying(true));
      ws.on('pause', () => setIsPlaying(false));
      ws.on('finish', () => setIsPlaying(false));
      ws.on('audioprocess', () => setCurrentTime(ws.getCurrentTime()));
      ws.on('ready', () => {
        setDuration(ws.getDuration());
        console.log('Audio ready');
        
        // Enable drag selection
        regions.enableDragSelection({
          color: 'rgba(255, 0, 0, 0.3)'
        });
        
        // Handle region updates
        regions.on('region-created', (region: Region) => {
          console.log('New region created:', region);
          // Remove any existing regions
          const existingRegions = regions.getRegions();
          existingRegions.forEach((existingRegion: Region) => {
            if (existingRegion !== region) existingRegion.remove();
          });
          
          setNoiseRegion({
            start: region.start,
            end: region.end
          });
          setError('');
        });

        regions.on('region-updated', (region: Region) => {
          console.log('Region updated:', region);
          setNoiseRegion({
            start: region.start,
            end: region.end
          });
          setError('');
        });
      });

      // Add error handling
      ws.on('error', (err: Error) => {
        console.error('WaveSurfer error:', err);
        setError('Error loading audio file');
      });

      // Load the audio file
      const audioUrl = URL.createObjectURL(file);
      ws.load(audioUrl);
      
      setWavesurfer(ws);

      // Cleanup function
      return () => {
        URL.revokeObjectURL(audioUrl);
        ws.destroy();
      };
    }
  }, [file]); // Only depend on file changes

  const handlePlayPause = () => {
    wavesurfer?.playPause();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    wavesurfer?.seekTo(time / duration);
    setCurrentTime(time);
  };

  const applyNoiseReduction = async () => {
    if (!wavesurfer || !noiseRegion) {
      setError('Please select a noise region first');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    
    try {
      const audioBuffer = await wavesurfer.getDecodedData();
      
      if (!audioBuffer) {
        throw new Error('Failed to decode audio data');
      }

      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );

      // Create source node
      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;

      // Create dynamics compressor
      const compressor = offlineContext.createDynamicsCompressor();
      compressor.threshold.value = -50 - (noiseReduction * 0.2);
      compressor.knee.value = 40;
      compressor.ratio.value = 12;
      compressor.attack.value = 0;
      compressor.release.value = 0.25;

      // Create filters
      const lowpass = offlineContext.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 7000 - (noiseReduction * 50);
      lowpass.Q.value = 1;

      const highpass = offlineContext.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 20 + (noiseReduction * 2);
      highpass.Q.value = 1;

      // Create gain node for final volume adjustment
      const gainNode = offlineContext.createGain();
      gainNode.gain.value = 1 + (noiseReduction * 0.005);

      // Connect nodes
      source.connect(highpass);
      highpass.connect(lowpass);
      lowpass.connect(compressor);
      compressor.connect(gainNode);
      gainNode.connect(offlineContext.destination);

      // Start rendering
      source.start();
      
      // Update progress periodically
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => Math.min(prev + 5, 90));
      }, 100);

      const renderedBuffer = await offlineContext.startRendering();

      clearInterval(progressInterval);
      
      // Convert to WAV and update waveform
      const wavData = audioBufferToWav(renderedBuffer);
      const processedUrl = URL.createObjectURL(
        new Blob([wavData], { type: 'audio/wav' })
      );
      
      await wavesurfer.load(processedUrl);
      URL.revokeObjectURL(processedUrl);

      setProcessingProgress(100);
      
    } catch (error) {
      console.error('Error processing audio:', error);
      setError('Failed to process audio');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-6 border border-gray-700">
      <div className="mb-6">
        {/* File Upload */}
        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-2">
            Upload Audio File
          </label>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile) {
                // Cleanup previous wavesurfer instance
                if (wavesurfer) {
                  wavesurfer.destroy();
                  setWavesurfer(null);
                }
                setFile(selectedFile);
                setNoiseRegion(null);
                setError('');
              }
            }}
            className="block w-full text-sm text-gray-300
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-600 file:text-white
              hover:file:bg-blue-700
              cursor-pointer"
          />
          <div className="mt-2 text-sm text-gray-400">
            File: {file?.name || 'No file selected'}
            {file && (
              <span className="ml-2">
                ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
            )}
          </div>
        </div>

        <div ref={waveformRef} className="mb-4 bg-gray-800 rounded-lg overflow-hidden" />
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        {/* Playback controls */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePlayPause}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
            >
              {isPlaying ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16"/>
                    <rect x="14" y="4" width="4" height="16"/>
                  </svg>
                  Pause
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <polygon points="5,3 19,12 5,21"/>
                  </svg>
                  Play
                </>
              )}
            </button>
            <span className="text-white">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Time slider */}
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Processing controls */}
        <div className="mt-6">
          {noiseRegion && (
            <div className="mb-4 text-green-400">
              ✓ Noise region selected: {formatTime(noiseRegion.start)} - {formatTime(noiseRegion.end)}
            </div>
          )}
          
          <div className="flex items-center gap-4 mb-4">
            <button
              className={`px-4 py-2 text-white rounded transition-colors duration-200 ${
                isProcessing 
                  ? 'bg-yellow-600 animate-pulse' 
                  : noiseRegion 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-gray-400'
              }`}
              onClick={applyNoiseReduction}
              disabled={isProcessing || !noiseRegion || !wavesurfer}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Reducing Noise...
                </div>
              ) : (
                'Apply Noise Reduction'
              )}
            </button>
          </div>

          {isProcessing && (
            <div className="flex items-center gap-2 text-white">
              <div className="w-full bg-gray-700 h-2 rounded-full">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${processingProgress}%` }}
                />
              </div>
              <span>{processingProgress.toFixed(0)}%</span>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Noise Reduction Level: {(noiseReduction).toFixed(0)}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={noiseReduction}
          onChange={(e) => setNoiseReduction(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="text-sm text-gray-300">
        <p>Instructions:</p>
        <ol className="list-decimal list-inside mt-2">
          <li>Upload an audio file (max 20MB)</li>
          <li>Use the play/pause button to preview the audio</li>
          <li>Adjust the noise reduction level using the slider</li>
          <li>Click "Apply Noise Reduction" to process the audio</li>
          <li>Wait for processing to complete</li>
        </ol>
      </div>
    </div>
  );
} 