// المسار: api/public-config.js
module.exports = function handler(req, res) {
  try {
    // السماح بطلبات القراءة من أي متصفح
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const projectId = process.env.FIREBASE_PROJECT_ID || "khedmety-plus";

    const publicConfig = {
      apiKey: process.env.PUBLIC_FIREBASE_API_KEY || "AIzaSyBm6ScIpi6LUzcfDOAYELae1Paz4Xh9L4c",
      authDomain: process.env.PUBLIC_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
      databaseURL: process.env.PUBLIC_FIREBASE_DATABASE_URL || `https://${projectId}-default-rtdb.europe-west1.firebasedatabase.app`,
      projectId: projectId,
      storageBucket: process.env.PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
      messagingSenderId: process.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "25101228841",
      appId: process.env.PUBLIC_FIREBASE_APP_ID || "1:25101228841:web:3164821d165014a1e2b538"
    };

    return res.status(200).json(publicConfig);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
