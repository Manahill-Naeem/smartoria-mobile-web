// app/api/orders/route.ts
import clientPromise from '@/utils/mongodb';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const orderData = await request.json();

    // Basic validation
    if (!orderData.userId || !orderData.items || orderData.items.length === 0 || !orderData.totalAmountPKR || !orderData.shippingDetails) {
      return NextResponse.json({ error: 'Missing required order data' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Order document ko 'orders' collection mein add karein
    const result = await db.collection('orders').insertOne({
      ...orderData,
      orderDate: new Date(), // Use current date for orderDate
      status: 'pending', // Initial status
    });

    console.log("Order placed successfully with ID:", result.insertedId);
    return NextResponse.json({ message: 'Order placed successfully', insertedId: result.insertedId });

  } catch (error: any) {
    console.error("Unhandled error in POST /api/orders:", error);
    return NextResponse.json({ error: 'Failed to place order due to an unexpected error', details: error.message }, { status: 500 });
  }
}
