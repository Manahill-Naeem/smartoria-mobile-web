// ./src/app/api/products/update.ts
import clientPromise from '@/utils/mongodb';
import { ObjectId } from 'mongodb'; // Correct import for ObjectId

export async function PUT(req: Request) {
  try {
    const { id, ...update } = await req.json();
    const client = await clientPromise;
    const db = client.db();

    // Validate if the ID is a valid ObjectId
    if (!ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ error: 'Invalid product ID format' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const result = await db.collection('products').updateOne(
      { _id: new ObjectId(id) }, // Using imported ObjectId
      { $set: update }
    );
    
    if (result.matchedCount === 0) {
        return new Response(JSON.stringify({ error: 'Product not found for update' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ modifiedCount: result.modifiedCount }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error: unknown) { // Changed 'e' to 'error: unknown'
    console.error('Error updating product:', error); // Using error variable
    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: 'Failed to update product', details: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ error: 'Failed to update product', details: 'An unknown error occurred' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}