document.addEventListener('DOMContentLoaded', () => {


const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");

const params = new URLSearchParams(window.location.search);
const username = params.get('username') || 'Anonymous';
const room = params.get('room') || 'Chat Room';

document.getElementById('room-name').innerText = room;

const socket = new WebSocket(`ws://localhost:3000`);

socket.addEventListener('open', () => {
    socket.send(JSON.stringify({ type: 'join', username, room }));
});

socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message');
    messageElement.innerHTML = `<strong>${data.user}</strong> <small>${data.time}</small><br>${formatMessage(data.text)}`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
});

sendBtn.addEventListener('click', () => {
    const msg = messageInput.value.trim();
    if (msg && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'message', text: msg }));
        messageInput.value = '';
    }
});

messageInput.addEventListener('keypress', event => {
    if (event.key === 'Enter') sendBtn.click();
});

function formatMessage(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/\*(.*?)\*/g, '<i>$1</i>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
}

});
