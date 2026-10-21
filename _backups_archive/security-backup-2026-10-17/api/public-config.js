// المسار: api/public-config.js
export default function handler(req, res) {
  try {
    // السماح بطلبات القراءة من أي متصفح
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const projectId = process.env.FIREBASE_PROJECT_ID || "khedmty-plus";

    const publicConfig = {
      apiKey: process.env.PUBLIC_FIREBASE_API_KEY || "AIzaSyBeS6IpIiUbiYOO4YlagtPsu4B9bL4c",
      authDomain: process.env.PUBLIC_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
      databaseURL: process.env.PUBLIC_FIREBASE_DATABASE_URL || `https://${projectId}-default-rtdb.europe-west1.firebasedatabase.app`,
      projectId: projectId,
      storageBucket: process.env.PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
      messagingSenderId: process.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "3510220845",
      appId: process.env.PUBLIC_FIREBASE_APP_ID || "1:3510220845:web:1b6482d1c656g1f20538"
    };

    return res.status(200).json(publicConfig);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
