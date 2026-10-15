// المسار: api/public-config.js
// وظيفة هذا الملف: تزويد المتصفح بإعدادات الاتصال العامة لـ Firebase بأمان وتلقائية تامة دون تدخل المستخدم

module.exports = (req, res) => {
  // السماح بطلبات القراءة وتخزينها مؤقتاً لتسريع الأداء
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // قراءة اسم المشروع من Vercel أو الاعتماد على اسم مشروعك الأساسي
  const projectId = process.env.FIREBASE_PROJECT_ID || "khedmty-plus";

  // تجهيز كائن الإعدادات العامة (يقرأ من Vercel Env أولاً، وإذا لم يجدها يستخدم إعدادات مشروعك مباشرة)
  const publicConfig = {
    apiKey: process.env.PUBLIC_FIREBASE_API_KEY || "AIzaSyBeS6IpIiUbiYOO4YlagtPsu4B9bL4c",
    authDomain: process.env.PUBLIC_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
    databaseURL: process.env.PUBLIC_FIREBASE_DATABASE_URL || `https://${projectId}-default-rtdb.europe-west1.firebasedatabase.app`,
    projectId
