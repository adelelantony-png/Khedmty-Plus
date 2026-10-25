/**
 * dev_server.js — خادم التطوير المحلي لمنظومة خدمتي برو (Khedmty-Plus)
 * يدعم خدمة الملفات الثابتة من public/ وتشغيل نقاط نهاية api/ محلياً
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const API_DIR = path.join(__dirname, 'api');

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webmanifest': 'application/manifest+json',
    '.pdf': 'application/pdf',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.csv': 'text/csv; charset=utf-8'
};

function serveStatic(req, res, pathname) {
    let cleanPath = pathname;
    if (cleanPath === '/' || cleanPath === '') {
        cleanPath = '/index.html';
    }

    let filePath = path.join(PUBLIC_DIR, cleanPath);

    // إذا كان المسار بدون امتداد، ابحث عن .html المطابق
    if (!path.extname(filePath) && fs.existsSync(filePath + '.html')) {
        filePath = filePath + '.html';
    }

    // تحقق من وجود الملف
    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
                <div style="font-family:sans-serif; text-align:center; padding:50px; direction:rtl;">
                    <h2 style="color:#dc2626;">404 — الصفحة غير موجودة</h2>
                    <p style="color:#64748b;">المسار المطلوب: <code>${pathname}</code></p>
                    <a href="/servant-dashboard.html" style="color:#1e3a8a; font-weight:bold;">الرجوع للوحة الخدمة</a>
                </div>
            `);
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Access-Control-Allow-Origin': '*'
        });

        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    });
}

async function handleApi(req, res, pathname) {
    const endpointName = pathname.replace(/^\/api\//, '').replace(/\.js$/, '');
    const apiFile = path.join(API_DIR, endpointName + '.js');

    if (!fs.existsSync(apiFile)) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'API endpoint not found', endpoint: endpointName }));
        return;
    }

    try {
        let bodyBuffer = [];
        req.on('data', chunk => bodyBuffer.push(chunk));
        req.on('end', async () => {
            const rawBody = Buffer.concat(bodyBuffer).toString();
            try {
                req.body = rawBody ? JSON.parse(rawBody) : {};
            } catch (e) {
                req.body = rawBody;
            }

            req.query = url.parse(req.url, true).query;

            res.status = function(code) {
                this.statusCode = code;
                return this;
            };
            res.json = function(data) {
                this.setHeader('Content-Type', 'application/json; charset=utf-8');
                this.end(JSON.stringify(data));
            };

            delete require.cache[require.resolve(apiFile)];
            const handler = require(apiFile);
            await handler(req, res);
        });
    } catch (err) {
        console.error(`[API Error] /api/${endpointName}:`, err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal Server Error', message: err.message }));
    }
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = decodeURIComponent(parsedUrl.pathname);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (pathname.startsWith('/api/')) {
        handleApi(req, res, pathname);
    } else {
        serveStatic(req, res, pathname);
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log('====================================================');
    console.log('🚀 خادم التطوير المحلي لمنظومة خدمتي برو (Khedmty-Plus)');
    console.log('====================================================');
    console.log(`- الكمبيوتر المحلي: http://localhost:${PORT}`);
    console.log(`- لوحة الخادم:     http://localhost:${PORT}/servant-dashboard.html`);
    console.log(`- شاشة المخدوم:    http://localhost:${PORT}/student.html`);
    console.log(`- رصد الدرجات:     http://localhost:${PORT}/servant_grades_entry.html`);
    console.log(`- المتابعة الروحية: http://localhost:${PORT}/servant_spiritual_report.html`);
    console.log(`- شبكة الموبايل:   http://192.168.1.167:${PORT}`);
    console.log('====================================================');
});
