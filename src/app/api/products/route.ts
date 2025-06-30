import clientPromise from '@/utils/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const products = await db.collection('products').find({}).toArray();
    return NextResponse.json(products);
  } catch (e) {
    console.error('GET /api/products error:', e); // Debug log
    return NextResponse.json({ error: 'Failed to fetch products', details: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Basic validation for required fields (title instead of name)
    const requiredFields = ['title', 'price', 'category', 'subcategory', 'image'];
    for (const field of requiredFields) {
      if (!body[field] || body[field].toString().trim() === '') {
        return NextResponse.json({ error: `Missing or empty field: ${field}` }, { status: 400 });
      }
    }
    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection('products').insertOne(body);
    return NextResponse.json({ insertedId: result.insertedId });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}
