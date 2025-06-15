from http.server import HTTPServer, SimpleHTTPRequestHandler
import os
import sys

class QRHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <title>WhatsApp QR Code</title>
                <meta charset="UTF-8">
                <style>
                    body {{
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        margin: 0;
                        background-color: #f0f2f5;
                        font-family: Arial, sans-serif;
                    }}
                    .container {{
                        background: white;
                        padding: 20px;
                        border-radius: 10px;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                        text-align: center;
                    }}
                    h1 {{
                        color: #128C7E;
                        margin-bottom: 20px;
                    }}
                    img {{
                        max-width: 300px;
                        height: auto;
                        margin: 20px 0;
                    }}
                    .refresh {{
                        color: #666;
                        font-size: 14px;
                        margin-top: 10px;
                    }}
                </style>
                <script>
                    function refreshImage() {{
                        const img = document.getElementById('qr');
                        img.src = '/qr.png?' + new Date().getTime();
                    }}
                    setInterval(refreshImage, 5000);
                </script>
            </head>
            <body>
                <div class="container">
                    <h1>WhatsApp QR Code</h1>
                    <img id="qr" src="/qr.png" alt="WhatsApp QR Code">
                    <p class="refresh">El QR se actualiza automáticamente cada 5 segundos</p>
                </div>
            </body>
            </html>
            """
            self.wfile.write(html.encode())
        elif self.path.startswith('/qr.png'):
            qr_path = '/root/CitaMedicaBeta/base-ts-baileys-memory/bot.qr.png'
            if os.path.exists(qr_path):
                self.send_response(200)
                self.send_header('Content-type', 'image/png')
                self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
                self.send_header('Pragma', 'no-cache')
                self.send_header('Expires', '0')
                self.end_headers()
                with open(qr_path, 'rb') as f:
                    self.wfile.write(f.read())
            else:
                self.send_error(404, "QR Code not found")

def run(port=8000):
    server_address = ('0.0.0.0', port)
    httpd = HTTPServer(server_address, QRHandler)
    print(f'Servidor iniciado en 0.0.0.0:{port}')
    print(f'Ruta del QR: /root/CitaMedicaBeta/base-ts-baileys-memory/bot.qr.png')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\nServidor detenido.')
        httpd.server_close()
        sys.exit(0)
    except Exception as e:
        print(f'Error: {e}')

if __name__ == '__main__':
    run(8000)
