export const handler = async (event) => {
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

  // Diagnostic: check if API key is available (value not logged)
  const apiKeyPresent = !!process.env.GROK_API_KEY;
  console.log('API key present:', apiKeyPresent);

  // For now, just echo back the message to confirm function works
  const reply = `Received your query: "${message}"\n\n(Backend is now running. Next we'll add Grok and Acuity calls.)`;

  return {
    statusCode: 200,
    body: JSON.stringify({ reply })
  };
};
