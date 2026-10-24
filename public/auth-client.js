/**
 * public/auth-client.js - العميل الموحد للمصادقة وإدارة الجلسات في المتصفح
 * يوفر استرجاع التوكن، والتحقق الصارم من الجلسات، واستدعاء واجهات الـ API الموثقة
 */
(function (root) {
    'use strict';

    const STORAGE_KEYS = {
        TOKEN: 'auth_token',
        ACTIVE_USER: 'my_church_active_user',
        ROLE: 'user_role',
        STUDENT_CODE: 'student_code'
    };

    function getStorage(type) {
        try {
            if (type === 'session' && typeof sessionStorage !== 'undefined') return sessionStorage;
            if (type === 'local' && typeof localStorage !== 'undefined') return localStorage;
        } catch (e) {}
        return null;
    }

    function doRedirect(url) {
        try {
            const loc = (typeof window !== 'undefined' && window.location) ? window.location : (typeof location !== 'undefined' ? location : null);
            if (loc && typeof loc.replace === 'function') {
                loc.replace(url);
                return;
            }
            if (loc) {
                loc.href = url;
            }
        } catch (e) {}
    }

    const AuthClient = {
        /**
         * استرجاع رمز المصادقة الحالي (ID Token)
         */
        getToken: function () {
            const s = getStorage('session'), l = getStorage('local');
            return (s && s.getItem(STORAGE_KEYS.TOKEN)) || (l && l.getItem(STORAGE_KEYS.TOKEN)) || '';
        },

        /**
         * استرجاع بيانات المستخدم النشط من كائن الجلسة المحفوظ
         */
        getActiveUser: function () {
            try {
                const s = getStorage('session'), l = getStorage('local');
                const str = (s && s.getItem(STORAGE_KEYS.ACTIVE_USER)) || (l && l.getItem(STORAGE_KEYS.ACTIVE_USER));
                if (!str) return null;
                const u = JSON.parse(str);
                if (!u || typeof u !== 'object') return null;
                // يجب أن يملك المستخدم دوراً صالحاً غير فارغ
                if (!u.role || typeof u.role !== 'string') return null;
                return u;
            } catch (e) {
                return null;
            }
        },

        /**
         * اسم مستعار متوافق مع كافة صفحات النظام لاسترجاع المستخدم النشط
         */
        getUser: function () {
            return this.getActiveUser();
        },

        /**
         * دور المستخدم الحالي (مستخرج حصراً من كائن الجلسة الموثقة لتفادي التلاعب بالـ localStorage)
         */
        getUserRole: function () {
            const u = this.getActiveUser();
            return u ? String(u.role).trim().toLowerCase() : '';
        },

        /**
         * كود الطالب أو كود الخادم
         */
        getUserCode: function () {
            const u = this.getActiveUser();
            if (u && (u.code || u.id)) {
                return String(u.code || u.id).trim();
            }
            const s = getStorage('session'), l = getStorage('local');
            return String((s && s.getItem(STORAGE_KEYS.STUDENT_CODE)) || (l && l.getItem(STORAGE_KEYS.STUDENT_CODE)) || '').trim();
        },

        /**
         * هل المستخدم مسجل دخوله حالياً بجلسة صالحة؟
         */
        isAuthenticated: function () {
            const u = this.getActiveUser();
            if (!u) return false;
            const role = this.getUserRole();
            if (!role) return false;
            if (role === 'student') {
                const code = this.getUserCode();
                if (!code) return false;
            }
            return true;
        },

        /**
         * هل الجلسة موثقة برمز سحابي حقيقي صالح (Firebase ID Token)؟
         */
        isCloudAuthenticated: function () {
            const t = this.getToken();
            return Boolean(t && typeof t === 'string' && t.trim().length > 15);
        },

        /**
         * تهيئة مراقب تجديد التوكن التلقائي لـ Firebase Auth لضمان عدم انقطاع الجلسة
         */
        setupTokenRefreshListener: function () {
            if (typeof firebase !== 'undefined' && firebase.auth && typeof firebase.auth === 'function') {
                try {
                    firebase.auth().onIdTokenChanged(async function (user) {
                        if (user) {
                            try {
                                const freshToken = await user.getIdToken();
                                const s = getStorage('session'), l = getStorage('local');
                                if (s && s.getItem(STORAGE_KEYS.TOKEN)) s.setItem(STORAGE_KEYS.TOKEN, freshToken);
                                if (l && l.getItem(STORAGE_KEYS.TOKEN)) l.setItem(STORAGE_KEYS.TOKEN, freshToken);
                            } catch (err) {
                                console.warn('تعذر تحديث الـ ID Token تلقائياً:', err.message);
                            }
                        }
                    });
                } catch (e) {}
            }
        },

        /**
         * فرض حماية الصفحة والتأكد الصارم من تسجيل الدخول والدور المصرح
         */
        enforceAuth: function (allowedRoles, redirectUrl = 'index.html') {
            if (!this.isAuthenticated()) {
                doRedirect(redirectUrl);
                return false;
            }
            if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
                const currentRole = this.getUserRole();
                if (!allowedRoles.includes(currentRole)) {
                    // إذا كان مخدوماً يحاول دخول شاشة خادم، يتم تحويله للوحة المخدوم
                    if (currentRole === 'student') {
                        doRedirect('student.html');
                    } else {
                        doRedirect(redirectUrl);
                    }
                    return false;
                }
            }
            return true;
        },

        /**
         * فحص هل رمز التوكن منتهي الصلاحية أو قارب على الانتهاء
         */
        isTokenExpired: function (token) {
            if (!token || typeof token !== 'string') return true;
            try {
                const parts = token.split('.');
                if (parts.length !== 3) return true;
                const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
                if (!payload.exp) return false;
                // إذا كان متبقياً أقل من 5 دقائق على انتهاء التوكن نعتبره منتهياً لنجدده مسبقاً
                return (Date.now() / 1000) >= (payload.exp - 300);
            } catch (e) {
                return false;
            }
        },

        /**
         * انتظار استعادة جلسة مستخدم Firebase Auth من IndexedDB عند فتح الصفحة
         */
        waitForAuthUser: async function (timeoutMs = 2500) {
            if (typeof firebase === 'undefined' || !firebase.auth || typeof firebase.auth !== 'function') {
                return null;
            }
            try {
                if (firebase.auth().currentUser) {
                    return firebase.auth().currentUser;
                }
                return await new Promise(resolve => {
                    let resolved = false;
                    const timer = setTimeout(() => {
                        if (!resolved) {
                            resolved = true;
                            resolve(firebase.auth().currentUser || null);
                        }
                    }, timeoutMs);

                    const unsubscribe = firebase.auth().onAuthStateChanged(user => {
                        if (!resolved) {
                            resolved = true;
                            clearTimeout(timer);
                            if (typeof unsubscribe === 'function') unsubscribe();
                            resolve(user);
                        }
                    });
                });
            } catch (e) {
                console.warn('waitForAuthUser warning:', e);
                return null;
            }
        },

        /**
         * استرجاع رمز المصادقة المحدث (ID Token) مع فحصه وتجديده تلقائياً من Firebase Auth
         */
        getFreshToken: async function (forceRefresh = false) {
            let token = this.getToken();
            const expired = this.isTokenExpired(token);

            if (forceRefresh || expired || !token || typeof token !== 'string' || token.trim().length < 15) {
                try {
                    const user = await this.waitForAuthUser(2500);
                    if (user && typeof user.getIdToken === 'function') {
                        const freshToken = await user.getIdToken(forceRefresh || expired);
                        if (freshToken) {
                            token = freshToken;
                            const s = getStorage('session'), l = getStorage('local');
                            if (s) s.setItem(STORAGE_KEYS.TOKEN, freshToken);
                            if (l) l.setItem(STORAGE_KEYS.TOKEN, freshToken);
                            return freshToken;
                        }
                    }
                } catch (e) {
                    console.warn('تعذر استخراج freshToken من Firebase Auth:', e);
                }
            }
            return token || '';
        },

        /**
         * استدعاء واجهات الـ API مع إرفاق رمز التوكن وتجديده وإعادة المحاولة التلقائية عند 401
         */
        fetch: async function (url, options = {}) {
            const opts = Object.assign({}, options);
            opts.headers = Object.assign({}, opts.headers || {});

            let token = await this.getFreshToken(false);
            if (token && !opts.headers['Authorization']) {
                opts.headers['Authorization'] = 'Bearer ' + token;
            }

            try {
                let response = await fetch(url, opts);

                // إذا كان الرمز منتهياً (401)، نقوم بتجديده قسرياً وإعادة المحاولة تلقائياً لمرة واحدة
                if (response.status === 401) {
                    try {
                        const freshToken = await this.getFreshToken(true);
                        if (freshToken && freshToken !== token) {
                            opts.headers['Authorization'] = 'Bearer ' + freshToken;
                            response = await fetch(url, opts);
                        }
                    } catch (refreshErr) {
                        console.warn('فشل تجديد التوكن وإعادة المحاولة عند 401:', refreshErr);
                    }
                }
                return response;
            } catch (networkError) {
                console.warn('تعذر الاتصال بالخادم، قد يكون قيد التشغيل المحلي:', networkError.message);
                throw networkError;
            }
        },

        /**
         * تسجيل الخروج الموحد ومسح جميع مفاتيح الجلسة
         */
        logout: function (redirectUrl = 'index.html') {
            const sessionKeys = [
                'my_church_active_user',
                'auth_token',
                'user_role',
                'student_code',
                'student_name',
                'student_level',
                'student_points',
                'my_active_session_id',
                'cloud_auth_email',
                'cloud_auth_pass'
            ];
            const s = getStorage('session'), l = getStorage('local');
            sessionKeys.forEach(k => {
                try {
                    if (l) l.removeItem(k);
                    if (s) s.removeItem(k);
                } catch (e) {}
            });
            if (typeof firebase !== 'undefined' && firebase.auth) {
                try {
                    const p = firebase.auth().signOut();
                    if (p && typeof p.then === 'function') {
                        p.catch(() => {}).finally(() => doRedirect(redirectUrl));
                        return;
                    }
                } catch (e) {}
            }
            doRedirect(redirectUrl);
        },

        /**
         * الحصول على الصفحة الرئيسية الرسمية وفق دور المستخدم الموثق
         */
        getHomeUrl: function () {
            const role = this.getUserRole();
            if (role === 'admin' || role === 'servant') {
                return 'servant-dashboard.html';
            }
            if (role === 'student') {
                return 'student.html';
            }
            return 'index.html';
        },

        /**
         * تسجيل مسار التصفح الحالي في سجل آمن لمنع الحلقات
         */
        recordNavHistory: function () {
            if (typeof window === 'undefined') return;
            try {
                const s = getStorage('session');
                if (!s) return;
                const path = window.location.pathname.split('/').pop() || 'index.html';
                const currentFile = path.split('?')[0];
                const last = s.getItem('_khedmety_curr_page');
                if (last && last !== currentFile && last !== 'logout.html') {
                    s.setItem('_khedmety_prev_page', last);
                }
                s.setItem('_khedmety_curr_page', currentFile);
            } catch (e) {}
        },

        /**
         * نظام الرجوع الذكي والآمن (Smart Back Navigation):
         * 1. العودة للصفحة السابقة الفعلية إذا كانت آمنة وداخل نفس التطبيق.
         * 2. منع العودة إلى صفحة تسجيل الدخول للمستخدمين الموثقين.
         * 3. منع العودة إلى صفحات خارجية أو صفحة الخروج أو حلقات التكرار.
         * 4. في حالة عدم وجود سجل سابق (فتح مباشر، PWA)، العودة للصفحة المناسبة لدور المستخدم.
         */
        navigateBack: function (fallbackUrl, event) {
            if (event && typeof event.preventDefault === 'function') {
                event.preventDefault();
            }

            const homeUrl = this.getHomeUrl();
            let targetFallback = fallbackUrl || homeUrl;
            const currentFile = (typeof window !== 'undefined' && window.location.pathname ? window.location.pathname.split('/').pop() || '' : '').split('?')[0];

            // منع إعادة المستخدم الموثق إلى صفحة الدخول أو لنفس الصفحة الحالية
            if (this.isAuthenticated() && targetFallback.includes('index.html')) {
                targetFallback = homeUrl;
            }
            if (targetFallback === currentFile && currentFile !== homeUrl) {
                targetFallback = homeUrl;
            }

            // فحص صحة وأمان المرجع (document.referrer)
            let referrerSafe = false;
            let referrerFile = '';
            if (typeof document !== 'undefined' && document.referrer) {
                try {
                    const refUrl = new URL(document.referrer, window.location.href);
                    // التحقق من أن المرجع من نفس المصدر (Same Origin)
                    if (refUrl.origin === window.location.origin) {
                        const refPath = refUrl.pathname.split('/').pop() || '';
                        referrerFile = refPath.split('?')[0];
                        const currentFile = (window.location.pathname.split('/').pop() || '').split('?')[0];

                        // صفحات محظور العودة إليها
                        const forbidden = ['logout.html', currentFile];
                        if (this.isAuthenticated()) {
                            forbidden.push('index.html');
                        }

                        if (referrerFile && !forbidden.includes(referrerFile)) {
                            referrerSafe = true;
                        }
                    }
                } catch (e) {}
            }

            // 1. إذا تم تحديد وجهة صريحة مخصصة بتبويب أو معلمات استعلام أو صفحة محددة (مثل servant-dashboard.html?tab=membersTab)
            // ننتقل إليها فوراً منعاً للضياع أو الخروج من اللوحة
            if (fallbackUrl && (fallbackUrl.includes('?') || fallbackUrl.includes('servant-dashboard.html') || fallbackUrl !== homeUrl)) {
                doRedirect(targetFallback);
                return;
            }

            // 2. إذا كان المرجع آمناً ونفس النطاق ويوجد سجل تصفح في المتصفح
            if (referrerSafe && typeof window !== 'undefined' && window.history && window.history.length > 1) {
                window.history.back();
                return;
            }

            // 3. فحص الصفحة السابقة المسجلة في الجلسة الداخلية
            try {
                const s = getStorage('session');
                const sessionPrev = s ? s.getItem('_khedmety_prev_page') : null;
                const currentFile = (window.location.pathname.split('/').pop() || '').split('?')[0];
                if (sessionPrev && sessionPrev !== currentFile && sessionPrev !== 'logout.html') {
                    if (!this.isAuthenticated() || sessionPrev !== 'index.html') {
                        doRedirect(sessionPrev);
                        return;
                    }
                }
            } catch (e) {}

            // 4. الوجهة الافتراضية الآمنة
            doRedirect(targetFallback);
        }
    };

    // تفعيل مراقب التوكن والرجوع الذكي التلقائي
    if (typeof window !== 'undefined') {
        AuthClient.recordNavHistory();

        // دالة عامة متوافقة مع جميع الصفحات
        window.goBack = function (fallback, event) {
            AuthClient.navigateBack(fallback, event);
        };

        const onReady = function () {
            AuthClient.setupTokenRefreshListener();
            AuthClient.recordNavHistory();

            // ربط تلقائي لأي زر يحمل السمة data-smart-back أو الكلاس btn-smart-back
            document.addEventListener('click', function (e) {
                const btn = e.target && e.target.closest ? e.target.closest('[data-smart-back], .btn-smart-back') : null;
                if (btn) {
                    const fallback = btn.getAttribute('data-fallback') || btn.getAttribute('href');
                    AuthClient.navigateBack(fallback, e);
                }
            });
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', onReady);
        } else {
            onReady();
        }
    }


    // ==========================================
    // حماية شاملة لجميع شاشات الموقع ضد F12 و DevTools وفحص العناصر
    // ==========================================
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        // 1. تعطيل زر الفأرة الأيمن لمنع القوائم وفحص العناصر Inspect
        document.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            return false;
        }, { capture: true });

        // 2. حظر مفاتيح المطورين F12 واختصارات لوحة المفاتيح
        window.addEventListener('keydown', function (e) {
            // F12
            if (e.key === 'F12' || e.keyCode === 123) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            // Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Inspect Element)
            if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c' || e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            // Ctrl+U (عرض كود المصدر View Source)
            if (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            // Ctrl+S (حفظ الصفحة Save Page)
            if (e.ctrlKey && (e.key === 'S' || e.key === 's' || e.keyCode === 83)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }, { capture: true });
    }

    if (root) {
        root.AuthClient = AuthClient;
    }
    if (typeof window !== 'undefined') {
        window.AuthClient = AuthClient;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = AuthClient;
    }
})(typeof window !== 'undefined' ? window : global);
