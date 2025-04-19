import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { ChatMessage, ChatMetadata, ChatSession } from '@/types/chat';

const CHATS_DIR = path.join(process.cwd(), 'chats');

// Ensure chats directory exists
async function ensureChatsDir() {
  try {
    await fs.access(CHATS_DIR);
  } catch {
    await fs.mkdir(CHATS_DIR, { recursive: true });
  }
}

// GET /api/chats - List all chats
export async function GET() {
  try {
    await ensureChatsDir();
    const files = await fs.readdir(CHATS_DIR);
    const metaFiles = files.filter(f => f.endsWith('.meta.json'));
    
    const chats = await Promise.all(
      metaFiles.map(async (file) => {
        const content = await fs.readFile(path.join(CHATS_DIR, file), 'utf-8');
        return JSON.parse(content);
      })
    );
    
    // Sort by timestamp descending (newest first)
    return NextResponse.json(chats.sort((a, b) => b.timestamp - a.timestamp));
  } catch (error) {
    console.error('Error listing chats:', error);
    return NextResponse.json({ error: 'Failed to list chats' }, { status: 500 });
  }
}

// POST /api/chats - Create new chat
export async function POST(request: Request) {
  try {
    await ensureChatsDir();
    const { title } = await request.json();
    
    const chatId = uuidv4();
    const timestamp = Date.now();
    
    const metadata: ChatMetadata = {
      id: chatId,
      title,
      timestamp,
      tokenUsage: {
        input: 0,
        output: 0,
        total: 0
      }
    };
    
    // Create both files with proper formatting
    await Promise.all([
      fs.writeFile(
        path.join(CHATS_DIR, `${chatId}.json`),
        '[]',
        'utf-8'
      ),
      fs.writeFile(
        path.join(CHATS_DIR, `${chatId}.meta.json`),
        JSON.stringify(metadata, null, 2),
        'utf-8'
      )
    ]);
    
    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 });
  }
} 