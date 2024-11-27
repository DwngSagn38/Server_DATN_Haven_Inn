const admin = require('firebase-admin');
const serviceAccount = require('./da-haven-inn-firebase-adminsdk-sq8fm-fec7a8442a.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
