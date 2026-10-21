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
         * استدعاء واجهات الـ API مع إرفاق رمز التوكن تلقائياً
         */
        fetch: async function (url, options = {}) {
            const opts = Object.assign({}, options);
            opts.headers = Object.assign({}, opts.headers || {});

            const token = this.getToken();
            if (token && !opts.headers['Authorization']) {
                opts.headers['Authorization'] = 'Bearer ' + token;
            }

            try {
                const response = await fetch(url, opts);
                // إذا كان الرمز منتهياً أو غير مصرح به
                if (response.status === 401) {
                    console.warn('تنبيه: الجلسة منتهية أو التوكن غير صالح (401)');
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

            // إذا كان المرجع آمناً ويوجد سجل تصفح في المتصفح
            if (referrerSafe && typeof window !== 'undefined' && window.history && window.history.length > 1) {
                window.history.back();
                return;
            }

            // فحص الصفحة السابقة المسجلة في الجلسة الداخلية
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

            // الوجهة الافتراضية الآمنة
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
