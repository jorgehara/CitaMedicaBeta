// reset-dr-jorge-password.js
// Resetea la contraseña del Dr. Jorge Hara usando bcryptjs del backend

var bcrypt = require('bcryptjs');
var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://Jorge:JaraJorge*2025*!@localhost:27017/consultorio?authSource=admin';
var newPassword = 'DrJorgeHara*2025!';

async function main() {
    var client = new MongoClient(url);
    await client.connect();
    var db = client.db('consultorio');

    // bcrypt hash de la nueva contraseña
    var hash = await bcrypt.hash(newPassword, 10);

    console.log("=== RESETEAR CONTRASEÑA Dr. Jorge Hara ===");
    console.log("Nueva password: " + newPassword);
    console.log("Hash generado (primeros 50 chars): " + hash.substring(0, 50) + "...");

    var result = await db.collection('users').updateOne(
        { email: 'admin@dr-jorgehara.micitamedica.me' },
        {
            $set: {
                password: hash,
                updatedAt: new Date()
            }
        }
    );

    console.log("");
    console.log("Modificado: " + result.modifiedCount + " documento(s)");
    console.log("Matched: " + result.matchedCount + " documento(s)");

    if (result.modifiedCount > 0) {
        console.log("");
        console.log("✅ CONTRASEÑA ACTUALIZADA");
        console.log("   Email: admin@dr-jorgehara.micitamedica.me");
        console.log("   Password: " + newPassword);
    } else {
        console.log("");
        console.log("⚠️  NO se modificó nada. Verificar que el email exista.");
    }

    await client.close();
}

main().catch(console.error);
