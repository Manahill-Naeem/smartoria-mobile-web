// app/api/products/[id]/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/utils/mongodb';
import { ObjectId } from 'mongodb';

// This API route fetches a single product by its ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } } // `params` contains dynamic route segments like [id]
) {
  try {
    const { id } = params; // Extract the product ID from the URL parameters

    const client = await clientPromise;
    const db = client.db();
    // Only fetch by MongoDB ObjectId (no dummy id fallback)
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 });
    }
    const product = await db.collection('products').findOne({ _id: new ObjectId(id) });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    // Return the product data
    return NextResponse.json(product);

  } catch (error: any) {
    console.error("Error fetching single product:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
