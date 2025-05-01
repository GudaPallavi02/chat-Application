

document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const room = document.getElementById('room').value.trim();

    if (username && room) {
      window.location.href = `chat.html?username=${username}&room=${room}`;
    }
    else {
        alert('Please enter both username and room!')
    }
  });