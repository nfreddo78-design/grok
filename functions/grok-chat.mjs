import OpenAI from 'openai';

const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

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

  const apiKey = process.env.GROK_API_KEY;

  if (!apiKey) {
    console.error('GROK_API_KEY is missing in environment variables');
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
      model: 'grok-beta',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful booking assistant for Castlemaine Flyer airport transfers. Be clear, polite and concise. Extract flight number, date, address. Suggest pickup time and price. Ask for confirmation before booking.'
        },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    const reply = completion.choices?.[0]?.message?.content || 'No response generated.';

    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };
  } catch (error) {
    console.error('Grok API error:', error.message || error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `API call failed: ${error.message || 'Unknown error'}` })
    };
  }
};

export { handler };
