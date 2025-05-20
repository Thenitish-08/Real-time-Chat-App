const socket = io();
function joinRoom() {
    const username = document.getElementById('username').value.trim();
    const room = document.getElementById('room').value.trim();
    if (!username || !room) return alert('Enter username and room');
    socket.emit('joinRoom', { username, room });
    document.getElementById('join-form').classList.add('hidden');
    document.getElementById('chat-container').classList.remove('hidden');
    document.querySelector('.chat-header').textContent = `Room: ${room}`;
}
function sendMessage() {
    const input = document.getElementById('messageInput');
    const msg = input.value.trim();
    if (msg === '') return;
    socket.emit('chatMessage', msg);
    input.value = '';
    input.focus();
}
function clearChat() {
    const room = document.getElementById('room').value.trim();
    if (confirm('Are you sure you want to delete all chat messages?')) {
        socket.emit('clearChat', room);
    }
}
// Load saved chat
socket.on('chatHistory', messages => {
    const chatBox = document.getElementById('chat-messages');
    chatBox.innerHTML = '';
    messages.forEach(({ user, text, time }) => {
        appendMessage(user, text, time);
    });
});
// New messages
socket.on('message', ({ user, text, time }) => {
    appendMessage(user, text, time);
});
socket.on('cleared', () => {
    document.getElementById('chat-messages').innerHTML = '';
    appendMessage('System', 'Chat history cleared.', new Date().toLocaleTimeString());
});
function appendMessage(user, text, time) {
    const chatBox = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('chat-message');
    msgDiv.innerHTML = `
        <span class="user">${user} <span class="time">${time}</span></span>
        <span class="text">${text}</span>
    `;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}
