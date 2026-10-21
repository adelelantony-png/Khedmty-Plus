/**
 * public/auth-client.js - العميل الموحد للمصادقة وإدارة الجلسات في المتصفح
 * يوفر استرجاع التوكن، والتحقق من الجلسات، واستدعاء واجهات الـ API الموثقة
 */
(function (window) {
    'use strict';

    const STORAGE_KEYS = {
        TOKEN: 'auth_token',
        ACTIVE_USER: 'my_church_active_user',
        ROLE: 'user_role',
        STUDENT_CODE: 'student_code'
    };

    const AuthClient = {
        /**
         * استرجاع رمز المصادقة الحالي (ID Token)
         */
        getToken: function () {
            return sessionStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem(STORAGE_KEYS.TOKEN) || '';
        },

        /**
         * استرجاع بيانات المستخدم النشط
         */
        getActiveUser: function () {
            try {
                const str = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER) || sessionStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
                return str ? JSON.parse(str) : null;
            } catch (e) {
                return null;
            }
        },

        /**
         * دور المستخدم الحالي
         */
        getUserRole: function () {
            const role = localStorage.getItem(STORAGE_KEYS.ROLE);
            if (role) return role;
            const u = this.getActiveUser();
            return u ? u.role : '';
        },

        /**
         * كود الطالب أو كود الخادم
         */
        getUserCode: function () {
            const code = localStorage.getItem(STORAGE_KEYS.STUDENT_CODE);
            if (code) return code;
            const u = this.getActiveUser();
            return u ? (u.code || u.id || '') : '';
        },

        /**
         * هل المستخدم مسجل دخوله حالياً؟
         */
        isAuthenticated: function () {
            return !!this.getActiveUser() || !!this.getUserCode();
        },

        /**
         * فرض حماية الصفحة والتأكد من تسجيل الدخول والدور المصرح
         */
        enforceAuth: function (allowedRoles, redirectUrl = 'index.html') {
            if (!this.isAuthenticated()) {
                window.location.replace(redirectUrl);
                return false;
            }
            if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
                const currentRole = this.getUserRole();
                if (!allowedRoles.includes(currentRole)) {
                    window.location.replace(redirectUrl);
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
         * تسجيل الخروج ومسح الجلسة
         */
        logout: function (redirectUrl = 'index.html') {
            ['my_church_active_user', 'auth_token', 'user_role', 'student_code', 'student_name', 'student_level'].forEach(k => {
                localStorage.removeItem(k);
                sessionStorage.removeItem(k);
            });
            window.location.replace(redirectUrl);
        }
    };

    window.AuthClient = AuthClient;
})(window);
