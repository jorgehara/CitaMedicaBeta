// verify-dr-jorge-login-final.js
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

    console.log("=== LOGIN TEST dr-jorgehara.micitamedica.me ===");
    var result = await makeRequest(email, password, 'dr-jorgehara.micitamedica.me', '/api/auth/login', 'dr-jorgehara');
    console.log("Status: " + result.status);
    if (result.status === 200) {
        var body = JSON.parse(result.body);
        console.log("✅ LOGIN EXITOSO");
        console.log("Token: " + (body.data?.token ? "RECIBIDO" : "NO"));
    } else {
        console.log("❌ FALLO");
        console.log(result.body);
    }
}

main().catch(console.error);
