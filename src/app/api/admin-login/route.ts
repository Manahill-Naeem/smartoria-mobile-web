import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { password } = await req.json();
  // Only check password on the server, never expose in client code!
  if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 });
  }
}
