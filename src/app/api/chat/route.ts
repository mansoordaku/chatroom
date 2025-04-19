import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  try {
    const { message, chatId } = await request.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
    });

    const response = completion.choices[0]?.message?.content || '';
    
    // Calculate token usage
    const tokens = {
      input: completion.usage?.prompt_tokens || 0,
      output: completion.usage?.completion_tokens || 0,
      total: completion.usage?.total_tokens || 0
    };

    return NextResponse.json({
      response,
      tokens
    });
  } catch (error) {
    console.error('Error in chat completion:', error);
    return NextResponse.json(
      { error: 'Failed to get chat completion' },
      { status: 500 }
    );
  }
} 