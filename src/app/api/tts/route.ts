import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const AUDIO_DIR = path.join(process.cwd(), 'public', 'audio');

// Ensure audio directory exists
async function ensureAudioDir() {
  try {
    await fs.access(AUDIO_DIR);
  } catch {
    await fs.mkdir(AUDIO_DIR, { recursive: true });
  }
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    await ensureAudioDir();
    
    const fileName = `speech-${Date.now()}.mp3`;
    const filePath = path.join(AUDIO_DIR, fileName);
    
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // Return the URL path to the audio file
    return NextResponse.json({ 
      audioUrl: `/audio/${fileName}` 
    });
  } catch (error) {
    console.error('Error generating speech:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
} 