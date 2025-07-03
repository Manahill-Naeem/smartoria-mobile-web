// ./src/app/api/convert/route.ts
import { NextResponse } from 'next/server';

const API_KEY = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const baseCurrency = searchParams.get('base') || 'AUD';

  if (!API_KEY) {
    console.error('Exchange Rate API key is missing or not configured.');
    return NextResponse.json({ error: 'Server configuration error: Exchange Rate API key is missing.' }, { status: 500 });
  }

  try {
    const response = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${baseCurrency}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`External ExchangeRate-API responded with status ${response.status}:`, errorText);
      let errorMessage = `Failed to fetch exchange rates from external API. Status: ${response.status}.`;
      try {
          const errorJson = JSON.parse(errorText);
          errorMessage += ` Details: ${errorJson.error || errorText.substring(0, 200)}`;
      } catch {
          errorMessage += ` Raw Response: ${errorText.substring(0, 200)}...`;
      }
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const data = await response.json();

    if (data.result === 'error') {
      console.error('ExchangeRate-API reported an error:', data['error-type']);
      return NextResponse.json({ error: `ExchangeRate-API reported error: ${data['error-type']}` }, { status: 500 });
    }

    return NextResponse.json({ rates: data.conversion_rates });
  } catch (error: unknown) { // Changed to unknown
    console.error('Server error fetching exchange rates:', error);
    // Type guard for error object
    if (error instanceof Error) {
        return NextResponse.json({ error: 'Internal server error while fetching exchange rates', details: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error while fetching exchange rates', details: 'An unknown error occurred' }, { status: 500 });
  }
}