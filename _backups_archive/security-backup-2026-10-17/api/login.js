// api/login.js - مؤقت (المرحلة 0)
// سيُستبدل في المرحلة 2 بتسجيل دخول يقرأ من Firestore ويُصدر Custom Token.
// صفحة الدخول (index.html) تتجاهل هذا الرد وتكمل بالتحقق المحلي.
module.exports = (req, res) => {
  res.status(501).json({ success: false, message: 'قيد الإعداد (المرحلة 2)' });
};
