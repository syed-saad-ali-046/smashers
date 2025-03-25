import zmq
import time
import random
import json
import threading

class ZMQSender:
    def __init__(self, port=8060):
        self.port = port
        self.context = zmq.Context()
        self.socket = self.context.socket(zmq.PUSH)
        self.socket.bind(f"tcp://*:{port}")
        
        # Initial values
        self.start_flag = False
        self.stop_flag = False
        self.p1_score = 0
        self.p2_score = 0
        self.p1_win_state = False
        self.p2_win_state = False
        self.p1_text = "0"
        self.p2_text = "0"
        
        # Thread control
        self.running = True
        
        print(f"ZMQ sender started on port {self.port}. Waiting for connections...")
        
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
                
                # Update the flags and texts.
                # Note: If a new game is started, you may want to clear stop_flag.
                self.start_flag = new_start_flag
                self.stop_flag = new_stop_flag
                self.p1_win_state = new_p1_win_state
                self.p2_win_state = new_p2_win_state
                self.p1_text = new_p1_text
                self.p2_text = new_p2_text
                
            except ValueError:
                print("Invalid input, please enter 0 or 1 for boolean values.")

    def timer_function(self):
        """Continuously monitors for a game start and after 60 seconds overrides flags."""
        while self.running:
            # Wait until a game starts: start_flag True and stop_flag False
            while self.running and not self.start_flag:
                time.sleep(0.1)
            if not self.running:
                break

            print("Game started. Timer initiated for 60 seconds.")
            # Wait 60 seconds for the game session
            time.sleep(60)
            # After 60 seconds, if game is still active, override the flags
            if self.start_flag:
                self.start_flag = False
                self.stop_flag = True
                print("60 seconds complete: start_flag set to 0 and stop_flag set to 1")
            # Wait until the user resets the game (i.e. stop_flag becomes False)
            while self.running and self.stop_flag:
                time.sleep(0.1)

    def send_data(self):
        """Continuously sends updated data."""
        count = 0
        try:
            while self.running:
                # Randomly increment scores
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
                }
                
                # Send the message
                self.socket.send_json(message)
                count += 1
                time.sleep(0.5)
        except KeyboardInterrupt:
            print("\nStopping ZMQ sender...")
            self.running = False
        finally:
            self.socket.close()
            self.context.term()
            print("ZMQ sender stopped gracefully.")

    def start(self):
        """Starts the sender, input updater, and timer threads."""
        input_thread = threading.Thread(target=self.update_inputs)
        send_thread = threading.Thread(target=self.send_data)
        timer_thread = threading.Thread(target=self.timer_function)
        
        input_thread.start()
        send_thread.start()
        timer_thread.start()
        
        try:
            input_thread.join()
            send_thread.join()
            timer_thread.join()
        except KeyboardInterrupt:
            print("\nShutting down gracefully...")
            self.running = False
            input_thread.join()
            send_thread.join()
            timer_thread.join()
            print("All threads stopped. Exiting.")

if __name__ == "__main__":
    sender = ZMQSender()
    sender.start()
