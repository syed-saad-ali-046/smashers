import asyncio
import json
import websockets
import random
import time
import threading

class WebSocketSender:
    def __init__(self, websocket_port=8061):
        self.websocket_port = websocket_port
        self.clients = set()
        
        # Initial values
        self.start_flag = False
        self.stop_flag = False
        self.p1_score = 0
        self.p2_score = 0
        self.p1_win_state = False
        self.p2_win_state = False
        self.p1_text = "0"
        self.p2_text = "0"
        self.timer = 120 # time in seconds
        
        # Thread control
        self.running = True

        print(f"WebSocket sender started on port {self.websocket_port}. Waiting for connections...")

    def update_inputs(self):
        """Allows the user to update flags and texts in real-time."""
        while self.running:
            try:
                # Accept input from user to update flags in real-time
                new_start_flag = bool(int(input("Enter Start Flag (0/1): ")))
                new_stop_flag = bool(int(input("Enter Stop Flag (0/1): ")))
                new_p1_win_state = bool(int(input("Enter P1 Win State (0/1): ")))
                new_p2_win_state = bool(int(input("Enter P2 Win State (0/1): ")))
                new_p1_text = input("Enter P1 text code (1-5): ")
                new_p2_text = input("Enter P2 text code (1-5): ")
                
                # Update the flags and texts.
                self.start_flag = new_start_flag
                self.stop_flag = new_stop_flag
                self.p1_win_state = new_p1_win_state
                self.p2_win_state = new_p2_win_state
                self.p1_text = new_p1_text
                self.p2_text = new_p2_text
            except ValueError:
                print("Invalid input, please enter 0 or 1 for boolean values.")

    async def send_data(self, websocket, path=None):
        """Send data directly through WebSockets."""
        try:
            while self.running:
                # Randomly increment scores for both players
                self.p1_score += random.randint(10, 50)
                self.p2_score += random.randint(10, 50)
                
                # Create message dictionary
                message = {
                    "start_flag": self.start_flag,
                    "stop_flag": self.stop_flag,
                    "p1_score": str(self.p1_score),
                    "p2_score": str(self.p2_score),
                    "p1_win_state": self.p1_win_state,
                    "p2_win_state": self.p2_win_state,
                    "p1_text": self.p1_text,
                    "p2_text": self.p2_text,
                    "game_time": self.timer,
                }

                # Convert to JSON string
                json_message = json.dumps(message)
                
                # Send to the WebSocket client
                await websocket.send(json_message)
                
                # Control sending interval
                await asyncio.sleep(0.1)

        except websockets.exceptions.ConnectionClosed as e:
            print(f"WebSocket connection closed: {e}")

    async def start_websocket_server(self):
        """Start the WebSocket server."""
        # Pass the `send_data` function to the `websockets.serve` method
        server = await websockets.serve(
            self.send_data, "localhost", self.websocket_port
        )
        print(f"WebSocket server started on ws://localhost:{self.websocket_port}")
        return server

    async def run(self):
        """Run the server and manage threads."""
        # Start WebSocket server
        server = await self.start_websocket_server()

        # Start the input thread
        input_thread = threading.Thread(target=self.update_inputs)
        input_thread.start()
        
        try:
            await asyncio.Future()  # Keep the server running
        except asyncio.CancelledError:
            self.running = False
            server.close()
            await server.wait_closed()
            print("Server shutdown complete")
        finally:
            input_thread.join()

if __name__ == "__main__":
    websocket_sender = WebSocketSender()
    
    try:
        asyncio.run(websocket_sender.run())
    except KeyboardInterrupt:
        print("Shutting down WebSocket sender...")
