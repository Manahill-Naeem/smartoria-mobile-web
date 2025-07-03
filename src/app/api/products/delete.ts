// ./src/app/api/products/delete.ts
import clientPromise from '@/utils/mongodb';
// Remove NextResponse import
import { ObjectId } from 'mongodb'; // Correct import for ObjectId

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    const client = await clientPromise;
    const db = client.db();
    
    // Validate if the ID is a valid ObjectId
    if (!ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ error: 'Invalid product ID format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await db.collection('products').deleteOne({ _id: new ObjectId(id) }); // Using imported ObjectId
    
    if (result.deletedCount === 0) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ deletedCount: result.deletedCount }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: unknown) {
    console.error('Error deleting product:', error);
    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: 'Failed to delete product', details: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ error: 'Failed to delete product', details: 'An unknown error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}