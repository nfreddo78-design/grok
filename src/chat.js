input.addEventListener('keydown', async (e) => {
  if (e.key !== 'Enter' || !input.value.trim()) return;

  // Prevent default behaviour (new line OR form submit)
  e.preventDefault();

  const userMsg = input.value.trim();
  addMessage(userMsg, 'user');
  input.value = '';
  addMessage('Thinking...', 'assistant'); // temporary

  try {
    const res = await fetch('/api/grok-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMsg })
    });

    if (!res.ok) {
      throw new Error(`Server responded with status ${res.status}`);
    }

    const data = await res.json();

    // Remove "Thinking..." and show real reply
    messagesDiv.lastChild.remove();
    addMessage(data.reply || 'No reply received from assistant', 'assistant');
  } catch (err) {
    // Clean up thinking message
    if (messagesDiv.lastChild && messagesDiv.lastChild.textContent.includes('Thinking')) {
      messagesDiv.lastChild.remove();
    }
    addMessage('Error: Could not connect to assistant. ' + err.message + ' — Check your console (F12) or Netlify logs.', 'assistant');
    console.error('Fetch error:', err);
  }
});
