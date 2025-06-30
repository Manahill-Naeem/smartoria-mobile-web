import clientPromise from '@/utils/mongodb';
import { NextResponse } from 'next/server';

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection('products').deleteOne({ _id: new (require('mongodb').ObjectId)(id) });
    return NextResponse.json({ deletedCount: result.deletedCount });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
