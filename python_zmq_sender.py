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
        
        # Add time remaining counter
        self.time_remaining = 60
        
        # Thread control
        self.running = True
        self.timer_lock = threading.Lock()

        print(f"WebSocket sender started on port {self.websocket_port}. Waiting for connections...")

    def update_inputs(self):
        """Allows the user to update flags and texts in real-time."""
        while self.running:
            try:
                # Accept input from user
                new_start_flag = bool(int(input("Enter Start Flag (0/1): ")))
                new_stop_flag = bool(int(input("Enter Stop Flag (0/1): ")))
                new_p1_win_state = bool(int(input("Enter P1 Win State (0/1): ")))
                new_p2_win_state = bool(int(input("Enter P2 Win State (0/1): ")))
                new_p1_text = input("Enter P1 text code (1-5): ")
                new_p2_text = input("Enter P2 text code (1-5): ")
                
                with self.timer_lock:
                    # If we're starting a new game, reset the timer and scores
                    if new_start_flag and not self.start_flag:
                        self.time_remaining = 60
                        self.p1_score = 0
                        self.p2_score = 0
                    
                    # Update the flags and texts
                    self.start_flag = new_start_flag
                    self.stop_flag = new_stop_flag
                    self.p1_win_state = new_p1_win_state
                    self.p2_win_state = new_p2_win_state
                    self.p1_text = new_p1_text
                    self.p2_text = new_p2_text
                
            except ValueError:
                print("Invalid input, please enter 0 or 1 for boolean values.")

    def timer_function(self):
        """Continuously monitors for a game start and counts down from 60 seconds."""
        while self.running:
            # Wait for game start
            while self.running and not self.start_flag:
                time.sleep(0.1)
            
            if not self.running:
                break

            print("Game started. Timer initiated for 60 seconds.")
            
            # Main countdown loop
            with self.timer_lock:
                self.time_remaining = 60
            
            while self.running and self.start_flag:
                with self.timer_lock:
                    if self.time_remaining <= 0:
                        self.start_flag = False
                        self.stop_flag = True
                        print("60 seconds complete: start_flag set to 0 and stop_flag set to 1")
                        break
                    else:
                        self.time_remaining -= 1
                time.sleep(1)  # decrement timer every second
            
            # Wait for reset (for example, until stop_flag is cleared by user input)
            while self.running and self.stop_flag:
                time.sleep(0.1)

    async def send_data(self, websocket, path=None):
        """Send data directly through WebSockets, only when values change."""
        last_message = None  # Store last sent message to prevent unnecessary updates
        try:
            while self.running:
                with self.timer_lock:
                    # Optionally, only update scores when the game is active
                    if self.start_flag:
                        self.p1_score += random.randint(10, 50)
                        self.p2_score += random.randint(10, 50)
                    
                    message = {
                        "start_flag": self.start_flag,
                        "stop_flag": self.stop_flag,
                        "p1_score": str(self.p1_score),
                        "p2_score": str(self.p2_score),
                        "p1_win_state": self.p1_win_state,
                        "p2_win_state": self.p2_win_state,
                        "p1_text": self.p1_text,
                        "p2_text": self.p2_text,
                        "time_remaining": str(self.time_remaining)
                    }
                
                json_message = json.dumps(message)
                # Only send update if there is a change from the last sent message.
                if json_message != last_message:
                    await websocket.send(json_message)
                    last_message = json_message
                
                await asyncio.sleep(1)  # update interval: 1 second
        except websockets.exceptions.ConnectionClosed as e:
            print(f"WebSocket connection closed: {e}")

    async def start_websocket_server(self):
        """Start the WebSocket server."""
        server = await websockets.serve(
            self.send_data, "localhost", self.websocket_port
        )
        print(f"WebSocket server started on ws://localhost:{self.websocket_port}")
        return server

    async def run(self):
        """Run the server and manage threads."""
        server = await self.start_websocket_server()

        # Start the input and timer threads
        input_thread = threading.Thread(target=self.update_inputs)
        timer_thread = threading.Thread(target=self.timer_function)
        
        input_thread.start()
        timer_thread.start()
        
        try:
            await asyncio.Future()  # Run forever
        except asyncio.CancelledError:
            self.running = False
            server.close()
            await server.wait_closed()
            print("Server shutdown complete")
        finally:
            input_thread.join()
            timer_thread.join()

if __name__ == "__main__":
    websocket_sender = WebSocketSender()
    
    try:
        asyncio.run(websocket_sender.run())
    except KeyboardInterrupt:
        print("Shutting down WebSocket sender...")
