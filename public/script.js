const socket = io();

document.getElementById('create-room').addEventListener('click', () => {
    document.getElementById('lobby').style.display = 'block';
    document.getElementById('create-room').style.display = 'none';
    document.getElementById('join-room').style.display = 'none';
});

document.getElementById('join-room').addEventListener('click', () => {
    document.getElementById('lobby').style.display = 'block';
    document.getElementById('create-room').style.display = 'none';
    document.getElementById('join-room').style.display = 'none';
});

document.getElementById('enter-room').addEventListener('click', () => {
    const roomId = document.getElementById('room-id').value;
    const playerName = document.getElementById('player-name').value;
    const isHost = document.getElementById('create-room').style.display === 'none';
    socket.emit('joinRoom', { roomId, playerName, isHost });
    document.getElementById('lobby').style.display = 'none';
    document.getElementById('game').style.display = 'block';
});

socket.on('updatePlayers', (players) => {
    const playersDiv = document.getElementById('players');
    playersDiv.innerHTML = '';
    players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.innerText = player.name;
        playersDiv.appendChild(playerDiv);
    });
});

socket.on('setRole', (role, data) => {
    if (role === 'decider') {
        // Show the interface for selecting the imposter and entering the word
    } else if (role === 'imposter') {
        document.getElementById('word').style.display = 'none';
        // Show that the player is the imposter
    } else if (role === 'describer') {
        document.getElementById('word').style.display = 'block';
        document.getElementById('word').innerText = data;
    }
});

socket.on('endRound', (data) => {
    alert(data.message);
    document.getElementById('vote').style.display = 'none';
});

socket.on('endGame', (data) => {
    alert(data.message);
    document.getElementById('game').style.display = 'none';
    document.getElementById('create-room').style.display = 'block';
    document.getElementById('join-room').style.display = 'block';
});
