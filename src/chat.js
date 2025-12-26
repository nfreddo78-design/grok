const messagesDiv = document.getElementById('messages');
const input = document.getElementById('user-input');

function addMessage(text, role) {
  const div = document.createElement('div');
  div.textContent = (role === 'assistant' ? '🤖 ' : '👤 ') + text;
  div.style.marginBottom = '12px';
  div.style.padding = '8px';
  div.style.borderRadius = '8px';
  div.style.background = role === 'assistant' ? '#e0e0e0' : '#c0e0ff';
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

input.addEventListener('keypress', async (e) => {
  if (e.key !== 'Enter' || !input.value.trim()) return;
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

    if (!res.ok) throw new Error(`Server error: ${res.status}`);

    const data = await res.json();
    // Remove "Thinking..." and add real reply
    messagesDiv.lastChild.remove();
    addMessage(data.reply || 'No reply received', 'assistant');
  } catch (err) {
    messagesDiv.lastChild.remove();
    addMessage('Error: ' + err.message + ' — Check console (F12) or tell the devs!', 'assistant');
    console.error(err);
  }
});
