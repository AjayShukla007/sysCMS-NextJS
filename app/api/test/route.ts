import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Read potential token headers - adjust based on what your API expects
    const authHeader = request.headers.get('Authorization'); // Standard: "Bearer <token>"
    const tokenHeader = request.headers.get('token');       // Custom: "<token>" or "Bearer <token>"
    const xTokenHeader = request.headers.get('x-token');   // Another custom example

    let token;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (tokenHeader) {
      // Decide if you expect "Bearer" prefix here or just the token
      token = tokenHeader.startsWith('Bearer ') ? tokenHeader.split(' ')[1] : tokenHeader;
    } else if (xTokenHeader) {
      token = xTokenHeader; // Assuming no prefix for this custom header
    }
    // Add more checks if needed

    const body = await request.json();
    const { title, description } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const data = { title, description, token }; // Token will be undefined if no relevant header found
    console.log('Received data:', data);
    console.log('Headers:', Object.fromEntries([...request.headers.entries()]));
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error processing POST request:', error);
    // Check if the error is due to invalid JSON
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {

  const data = { message: 'Hello, this is a GET request!', timestamp: new Date() };
  return NextResponse.json(data);
}