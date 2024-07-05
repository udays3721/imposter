const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let rooms = {};

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('joinRoom', ({ roomId, playerName, isHost }) => {
        if (!rooms[roomId]) {
            rooms[roomId] = {
                players: [],
                host: socket.id,
                deciderIndex: 0,
                word: '',
                imposter: '',
                votes: {}
            };
        }
        rooms[roomId].players.push({ id: socket.id, name: playerName });
        socket.join(roomId);
        io.to(roomId).emit('updatePlayers', rooms[roomId].players);
    });

    socket.on('startGame', ({ roomId }) => {
        const room = rooms[roomId];
        room.deciderIndex = 0;
        startRound(roomId);
    });

    socket.on('selectImposter', ({ roomId, playerId }) => {
        const room = rooms[roomId];
        room.imposter = playerId;
    });

    socket.on('sendWord', ({ roomId, word }) => {
        const room = rooms[roomId];
        room.word = word;
        room.players.forEach(player => {
            if (player.id === room.imposter) {
                io.to(player.id).emit('setRole', 'imposter');
            } else {
                io.to(player.id).emit('setRole', 'describer', word);
            }
        });
    });

    socket.on('submitVote', ({ roomId, votedPlayerId }) => {
        const room = rooms[roomId];
        if (!room.votes[votedPlayerId]) {
            room.votes[votedPlayerId] = 0;
        }
        room.votes[votedPlayerId]++;
        if (Object.keys(room.votes).length === room.players.length - 1) {
            const imposterVotes = room.votes[room.imposter] || 0;
            const result = imposterVotes >= Math.floor(room.players.length / 2) ? 'Describers Win!' : 'You Lose';
            io.to(roomId).emit('endRound', { message: result });
            room.votes = {};
            room.deciderIndex++;
            if (room.deciderIndex < room.players.length) {
                startRound(roomId);
            } else {
                io.to(roomId).emit('endGame', { message: 'Game Over!' });
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        // Handle player disconnection logic
    });
});

function startRound(roomId) {
    const room = rooms[roomId];
    const decider = room.players[room.deciderIndex];
    io.to(room.host).emit('setRole', 'decider', { players: room.players.filter(player => player.id !== decider.id) });
}

const port = process.env.PORT || 4000;
server.listen(port, () => console.log(`Server running on port ${port}`));
