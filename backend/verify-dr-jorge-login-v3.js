// verify-dr-jorge-login-v3.js
var https = require('https');

function makeRequest(email, password, host, path) {
    return new Promise((resolve, reject) => {
        var postData = JSON.stringify({
            email: email,
            password: password
        });

        var options = {
            hostname: host,
            port: 443,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'Host': host
            }
        };

        var req = https.request(options, (res) => {
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

    console.log("=== VERIFICANDO LOGIN Dr. Jorge Hara (via HTTPS) ===");
    console.log("");

    // Test 1: Directo al backend vía micitamedica.me/api/auth/login
    // (Nginx proxies a localhost:3001)
    console.log("Test 1: https://micitamedica.me/api/auth/login");
    var result1 = await makeRequest(email, password, 'micitamedica.me', '/api/auth/login');
    console.log("Status: " + result1.status);
    if (result1.status === 200 || result1.status === 201) {
        var body1 = JSON.parse(result1.body);
        console.log("✅ LOGIN EXITOSO");
        console.log("Token recibido: " + (body1.data?.token ? "SI" : "NO"));
        if (body1.data?.token) {
            console.log("");
            console.log("=== RESUMEN DE CREDENCIALES ===");
            console.log("URL: https://dr-jorgehara.micitamedica.me");
            console.log("Email: " + email);
            console.log("Password: " + password);
            console.log("");
            console.log("⚠️  NOTA: El subdomain dr-jorgehara.micitamedica.me NO existe en DNS.");
            console.log("   Hasta que se agregue, usar: https://micitamedica.me");
        }
    } else {
        console.log("❌ LOGIN FALLÓ");
        console.log("Body: " + result1.body.substring(0, 300));
    }
}

main().catch(console.error);
