const io = require('socket.io-client');

const socket = io('http://localhost:3000');

const playerName = `Tester_${Math.floor(Math.random() * 1000)}`;

console.log(`Connecting as ${playerName}...`);

socket.on('connect', () => {
    console.log('✅ Connected to server! ID:', socket.id);

    // 1. Join Room
    console.log('🔹 Emitting join-room...');
    socket.emit('join-room', {
        username: playerName,
        avatar: 'hero-1'
    });
});

socket.on('current-users', (players) => {
    console.log(`✅ Received current-users (${Object.keys(players).length} players)`);

    // 2. Move Player (Mocking movement)
    console.log('🔹 Emitting player-move (walking into Meeting Room)...');
    socket.emit('player-move', {
        x: 40, // Inside meeting-room-1 (x:32, y:32, w:128, h:128)
        y: 40,
        direction: 'down'
    });
});

socket.on('room-changed', (data) => {
    console.log('✅ Received room-changed:', data);
    if (data.entered === 'meeting-room-1') {
        console.log('🎉 SUCCESS: Zone detection working!');
    }
});

socket.on('new-user-joined', (player) => {
    console.log('👤 New user joined:', player.username);
});

socket.on('disconnect', () => {
    console.log('❌ Disconnected');
});
