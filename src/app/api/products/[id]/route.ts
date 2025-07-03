// src/app/api/products/[id]/route.ts

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  return new Response(JSON.stringify({ id: params.id }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}