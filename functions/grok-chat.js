import { Handler } from '@netlify/functions';
import OpenAI from 'openai';

const grok = new OpenAI({
  apiKey: process.env.GROK_API_KEY || '',
  baseURL: 'https://api.x.ai/v1',
});

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { message } = body;

  if (!message) {
    return { statusCode: 400, body: 'Missing message' };
  }

  try {
    const response = await grok.chat.completions.create({
      model: "grok-beta", // Try "grok-beta" or check your API docs for exact model name
      messages: [
        { role: "system", content: "You are a friendly booking assistant for Castlemaine Flyer airport transfers. Keep replies short and helpful." },
        { role: "user", content: message }
      ],
      temperature: 0.7,
    });

    const reply = response.choices[0]?.message?.content || 'No response';

    return {
      statusCode: 200,
      body: JSON.stringify({ reply }),
    };
  } catch (error) {
    console.error('Grok API error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Grok API failed: ' + error.message }),
    };
  }
};

export { handler };
