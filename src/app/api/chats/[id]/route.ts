import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { ChatMessage, ChatMetadata } from '@/types/chat';

const CHATS_DIR = path.join(process.cwd(), 'chats');

// GET /api/chats/[id] - Get chat by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const filePaths = {
      messages: path.join(CHATS_DIR, `${id}.json`),
      metadata: path.join(CHATS_DIR, `${id}.meta.json`)
    };

    // Read both files
    const [messagesJson, metadataJson] = await Promise.all([
      fs.readFile(filePaths.messages, 'utf-8'),
      fs.readFile(filePaths.metadata, 'utf-8')
    ]);

    const metadata: ChatMetadata = JSON.parse(metadataJson);
    const messages: ChatMessage[] = JSON.parse(messagesJson);

    // Return both metadata and messages
    return NextResponse.json({
      ...metadata,
      messages
    });
  } catch (error) {
    console.error('Error loading chat:', error);
    return NextResponse.json({ error: 'Failed to load chat' }, { status: 500 });
  }
}

// PUT /api/chats/[id] - Update chat
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { messages: newMessages, newTokens, title } = await request.json();
    const filePaths = {
      messages: path.join(CHATS_DIR, `${id}.json`),
      metadata: path.join(CHATS_DIR, `${id}.meta.json`)
    };

    // Load existing messages
    let existingMessages: ChatMessage[] = [];
    try {
      const messagesJson = await fs.readFile(filePaths.messages, 'utf-8');
      existingMessages = JSON.parse(messagesJson);
    } catch (error) {
      console.log('No existing messages found, starting fresh');
    }

    // Combine existing and new messages
    const updatedMessages = Array.isArray(existingMessages) 
      ? [...existingMessages, ...newMessages]
      : newMessages;

    // Load and update metadata
    const metadataJson = await fs.readFile(filePaths.metadata, 'utf-8');
    const metadata: ChatMetadata = JSON.parse(metadataJson);

    // Update metadata
    if (title) {
      metadata.title = title;
    }

    // Update token usage
    if (newTokens) {
      metadata.tokenUsage.input += newTokens.input;
      metadata.tokenUsage.output += newTokens.output;
      metadata.tokenUsage.total = metadata.tokenUsage.input + metadata.tokenUsage.output;
    }

    // Save both files
    await Promise.all([
      fs.writeFile(filePaths.messages, JSON.stringify(updatedMessages, null, 2)),
      fs.writeFile(filePaths.metadata, JSON.stringify(metadata, null, 2))
    ]);

    // Return updated data
    return NextResponse.json({
      ...metadata,
      messages: updatedMessages
    });
  } catch (error) {
    console.error('Error updating chat:', error);
    return NextResponse.json({ error: 'Failed to update chat' }, { status: 500 });
  }
} 