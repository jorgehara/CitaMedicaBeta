// verify-dr-jorge-login-v2.js
var http = require('http');

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

    console.log("=== VERIFICANDO LOGIN Dr. Jorge Hara (via HTTPS) ===");
    console.log("");

    // Test 1: Directo al backend
    console.log("Test 1: Directo a micitamedica.me/api/auth/login");
    var result1 = await makeRequest(email, password, 'micitamedica.me', '/api/auth/login');
    console.log("Status: " + result1.status);
    if (result1.status === 200 || result1.status === 201) {
        var body1 = JSON.parse(result1.body);
        console.log("✅ LOGIN EXITOSO");
        console.log("Token recibido: " + (body1.data?.token ? "SI" : "NO"));
    } else {
        console.log("❌ LOGIN FALLÓ");
        console.log("Body: " + result1.body.substring(0, 200));
    }

    console.log("");

    // Test 2: Con X-Tenant-Subdomain header
    console.log("Test 2: Con header X-Tenant-Subdomain: dr-jorgehara");
    var result2 = await makeRequest(email, password, 'dr-jorgehara.micitamedica.me', '/api/auth/login');
    console.log("Status: " + result2.status);
    if (result2.status === 200 || result2.status === 201) {
        var body2 = JSON.parse(result2.body);
        console.log("✅ LOGIN EXITOSO");
        console.log("Token recibido: " + (body2.data?.token ? "SI" : "NO"));
    } else {
        console.log("❌ LOGIN FALLÓ");
        console.log("Body: " + result2.body.substring(0, 200));
    }
}

main().catch(console.error);
