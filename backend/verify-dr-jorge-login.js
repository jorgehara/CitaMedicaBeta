// verify-dr-jorge-login.js
var http = require('http');

function makeRequest(email, password) {
    return new Promise((resolve, reject) => {
        var postData = JSON.stringify({
            email: email,
            password: password
        });

        var options = {
            hostname: 'localhost',
            port: 3001,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        var req = http.request(options, (res) => {
            var data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({ status: res.statusCode, body: data });
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

async function main() {
    var email = 'admin@dr-jorgehara.micitamedica.me';
    var password = 'DrJorgeHara*2025!';

    console.log("=== VERIFICANDO LOGIN Dr. Jorge Hara ===");
    var result = await makeRequest(email, password);
    var body = JSON.parse(result.body);

    console.log("Status: " + result.status);
    console.log("Body: " + JSON.stringify(body, null, 2));

    if (result.status === 200 || result.status === 201) {
        console.log("");
        console.log("✅ LOGIN EXITOSO");
        console.log("Token recibido: " + (body.token ? "SI" : "NO"));
    } else {
        console.log("");
        console.log("❌ LOGIN FALLÓ");
    }
}

main().catch(console.error);
