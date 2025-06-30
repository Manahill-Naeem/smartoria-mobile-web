import { NextResponse } from 'next/server';

// ***************************************************************
// IMPORTANT: REPLACE THIS WITH YOUR ACTUAL, VALID API KEY from ExchangeRate-API.com
// Aapki key yahan hai: 'd91b2c79d985d9ccfcbb79a6'
// ***************************************************************
const API_KEY = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY; // <--- YAHAN APNI ASLI KEY HAI. Good!

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const baseCurrency = searchParams.get('base') || 'AUD';

  // --- KEY CHANGE HERE: SIMPLIFY THE CHECK ---
  // Ab hum sirf check karenge ki API_KEY string empty ya undefined toh nahi hai.
  // Placeholder string se comparison hata diya hai.
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
  } catch (error: any) {
    console.error('Server error fetching exchange rates:', error);
    return NextResponse.json({ error: 'Internal server error while fetching exchange rates', details: String(error) }, { status: 500 });
  }
}
