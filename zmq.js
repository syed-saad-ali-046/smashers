const { Pull } = require('zeromq');

// Store received messages
let receivedMessages = [];

// Start ZMQ socket to receive messages
async function startZmqReceiver() {
  console.log('Starting ZMQ receiver...');
  
  const socket = new Pull();
  const port = 8060;
  
  // Connect the socket
  await socket.connect(`tcp://localhost:${port}`);
  console.log(`Connected to tcp://localhost:${port}`);
  
  // Process messages
  for await (const [msg] of socket) {
    try {
      // Parse the JSON message
      const message = JSON.parse(msg.toString());
      console.log('Received message:', message);
      
      // Store the message
      receivedMessages.push(message);
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  }
}

// Start the receiver
startZmqReceiver().catch(err => console.error(err));
console.log('Listening for messages. Press Ctrl+C to exit.');

// Handle cleanup
process.on('SIGINT', () => {
  console.log('Closing ZMQ socket');
  process.exit();
});