import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const data = { title, description };
    console.log(data)
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error processing POST request:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');
  const description = searchParams.get('description');

  if (!title || !description) {
    return NextResponse.json({ error: 'Title and description query parameters are required' }, { status: 400 });
  }

  const data = { title, description };
  return NextResponse.json(data);
}