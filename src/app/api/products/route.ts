// ./src/app/api/products/route.ts
import clientPromise from '@/utils/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const products = await db.collection('products').find({}).toArray();
    return new Response(JSON.stringify(products), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: unknown) {
    console.error('GET /api/products error:', error);
    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: 'Failed to fetch products', details: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ error: 'Failed to fetch products', details: 'An unknown error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Basic validation for required fields (title instead of name)
    const requiredFields = ['title', 'price', 'category', 'subcategory', 'image'];
    for (const field of requiredFields) {
      if (!body[field] || body[field].toString().trim() === '') {
        return new Response(JSON.stringify({ error: `Missing or empty field: ${field}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection('products').insertOne(body);
    return new Response(JSON.stringify({ insertedId: result.insertedId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: unknown) {
    console.error('POST /api/products error:', error);
    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: 'Failed to add product', details: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ error: 'Failed to add product', details: 'An unknown error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}