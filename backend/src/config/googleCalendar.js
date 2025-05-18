require('dotenv').config();
const { google } = require('googleapis');
const path = require('path');

// Configuración de credenciales
const CREDENTIALS_PATH = path.join(__dirname, '../../credentials.json');
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

// Configuración de la autenticación
const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: SCOPES,
});

module.exports = {
    auth,
    CALENDAR_ID,
    credentials: {
        type: "service_account",
        project_id: "adept-watch-459422-a8",
        client_email: "charlybotv3@adept-watch-459422-a8.iam.gserviceaccount.com",
        credentials_path: path.join(__dirname, '../../credentials.json'),
    },
    calendar: {
        timeZone: 'America/Argentina/Buenos_Aires',
        language: 'es'
    }
};
