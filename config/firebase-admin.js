const admin = require('firebase-admin');
const serviceAccount = require('./toilasang123-6c7ba-firebase-adminsdk-m9nd1-725bd912cc.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
