import os
import http.server
import socketserver

class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True

class RequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/":
            self.path = "/index.html"  # Serve React entry point
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

def run_server(port=3000):
    os.chdir("build")  # Change to React's build directory
    server_address = ("localhost", port)
    httpd = ThreadedHTTPServer(server_address, RequestHandler)
    print(f"Serving React frontend at http://localhost:{port}")
    httpd.serve_forever()

if __name__ == "__main__":
    run_server(3000)
