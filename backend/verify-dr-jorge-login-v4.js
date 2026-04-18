// verify-dr-jorge-login-v4.js
var https = require('https');

function makeRequest(email, password, host, path, tenantSubdomain) {
    return new Promise((resolve, reject) => {
        var postData = JSON.stringify({
            email: email,
            password: password
        });

        var headers = {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'Host': host
        };

        if (tenantSubdomain) {
            headers['X-Tenant-Subdomain'] = tenantSubdomain;
        }

        var options = {
            hostname: host,
            port: 443,
            path: path,
            method: 'POST',
            headers: headers
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

    console.log("=== VERIFICANDO LOGIN Dr. Jorge Hara (con tenant header) ===");
    console.log("");

    // Test con X-Tenant-Subdomain
    console.log("Test: https://micitamedica.me/api/auth/login + X-Tenant-Subdomain: dr-jorgehara");
    var result = await makeRequest(email, password, 'micitamedica.me', '/api/auth/login', 'dr-jorgehara');
    console.log("Status: " + result.status);
    if (result.status === 200 || result.status === 201) {
        var body = JSON.parse(result.body);
        console.log("✅ LOGIN EXITOSO");
        console.log("");
        console.log("=== RESUMEN DE CREDENCIALES ===");
        console.log("URL: https://dr-jorgehara.micitamedica.me");
        console.log("Email: " + email);
        console.log("Password: " + password);
        console.log("");
        console.log("⚠️  NOTA: El subdomain dr-jorgehara.micitamedica.me NO existe en DNS todavía.");
        console.log("   Mientras tanto, accedé a: https://micitamedica.me");
        console.log("   Pero primero hay que crear el subdomain en Nginx + DNS.");
    } else {
        console.log("❌ LOGIN FALLÓ");
        console.log("Body: " + result.body);
    }
}

main().catch(console.error);
