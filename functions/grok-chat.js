import { Handler } from '@netlify/functions';
import OpenAI from 'openai';

const handler: Handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Parse incoming body safely
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { message } = body;

  if (!message || typeof message !== 'string') {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing or invalid message' }) };
  }

  // Get API key from environment (never hard-code it)
  const apiKey = process.env.GROK_API_KEY;

  if (!apiKey) {
    console.error('Missing GROK_API_KEY environment variable');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error: API key missing' })
    };
  }

  const openai = new OpenAI({
    apiKey,
    baseURL: 'https://api.x.ai/v1',
  });

  try {
    const completion = await openai.chat.completions.create({
      model: 'grok-beta',  // or 'grok-2-latest' / check your xAI dashboard for exact model name
      messages: [
        {
          role: 'system',
          content: `You are a helpful booking assistant for Castlemaine Flyer airport transfers in Victoria, Australia.
Be polite, concise and professional.
User provides natural language info about flight number, date, pickup/drop-off address.
Steps:
1. Use web search if needed to find flight times.
2. Suggest pickup time (2-3h before international, 90min-2h domestic).
3. Calculate price and check availability when tools are added.
4. Present clear quote and ask for confirmation before booking.`
        },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const reply = completion.choices?.[0]?.message?.content || 'No response generated.';

    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };
  } catch (error) {
    console.error('Grok API error:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Grok API call failed: ${error.message}` })
    };
  }
};

export { handler };
