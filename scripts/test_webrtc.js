const io = require('socket.io-client');

const SERVER_URL = 'http://localhost:3000';

// Simulate two players
const clientA = io(SERVER_URL);
const clientB = io(SERVER_URL);

let clientA_ID = '';
let clientB_ID = '';

console.log('🤖 Initializing WebRTC Signaling Test...');

// --- Client A Setup ---
clientA.on('connect', () => {
    clientA_ID = clientA.id;
    console.log(`👤 Client A connected (${clientA_ID})`);

    clientA.emit('join-room', { username: 'User_A', avatar: 'hero-1' });
});

// --- Client B Setup ---
clientB.on('connect', () => {
    clientB_ID = clientB.id;
    console.log(`👤 Client B connected (${clientB_ID})`);

    clientB.emit('join-room', { username: 'User_B', avatar: 'hero-2' });

    // Wait a bit for registration, then start the call
    setTimeout(startSignalingTest, 1000);
});

// --- The Test Logic ---
function startSignalingTest() {
    console.log('\n📡 STARTING SIGNAL TEST: Client B -> Client A');

    // Mock WebRTC Signal Data (SDP Offer)
    const mockSignalData = { type: 'offer', sdp: 'mock-sdp-data-string' };

    // Client B sends signal to Client A
    clientB.emit('send-signal', {
        targetSocketId: clientA_ID,
        signal: mockSignalData
    });
}

// --- Client A Listening for Signal ---
clientA.on('receive-signal', (data) => {
    console.log('✅ Client A RECEIVED signal from:', data.fromUserId);
    console.log('   Signal Content:', data.signal);

    if (data.fromUserId === clientB_ID && data.signal.type === 'offer') {
        console.log('\n🎉 SUCCESS: Signaling pipe is working!');
        console.log('   The backend successfully routed the data between peers.');
        console.log('   Actual video/audio will now flow P2P through this connection.');
        process.exit(0);
    } else {
        console.error('❌ Mismatch in signal data');
        process.exit(1);
    }
});
