import clientPromise from '@/utils/mongodb';
import { NextResponse } from 'next/server';

export async function PUT(req: Request) {
  try {
    const { id, ...update } = await req.json();
    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection('products').updateOne(
      { _id: new (require('mongodb').ObjectId)(id) },
      { $set: update }
    );
    return NextResponse.json({ modifiedCount: result.modifiedCount });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
