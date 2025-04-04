declare module 'rnnoise-wasm' {
  export interface DenoiseState {
    processFrame(frame: Float32Array): Float32Array;
    destroy(): void;
  }

  export interface RNNoiseModule {
    DenoiseState: new () => DenoiseState;
  }

  export default function init(): Promise<RNNoiseModule>;
} 