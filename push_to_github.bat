@echo off
chcp 65001 >nul
title تحديث مستودع GitHub - خدمتي برو
echo ================================================================
echo   تحديث ورفع مشروع خدمتي برو إلى GitHub دفعة واحدة
echo ================================================================
echo.

set GIT_EXE=C:\Users\AD_4_\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd\git.exe
if not exist "%GIT_EXE%" (
    set GIT_EXE=git
)

"%GIT_EXE%" --version >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [خطأ] تعذر العثور على Git.
    pause
    exit /b 1
)

if not exist ".git" (
    echo [1/4] تهيئة مستودع Git المحلي...
    "%GIT_EXE%" init -b main
)

"%GIT_EXE%" config user.name >nul 2>nul
if %ERRORLEVEL% neq 0 (
    "%GIT_EXE%" config user.name "Khedmety Servant"
    "%GIT_EXE%" config user.email "servant@khedmety.org"
)

"%GIT_EXE%" remote get-url origin >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo لم يتم ربط رابط المستودع بعد.
    echo يرجى نسخ رابط المستودع من GitHub (ينتهي بـ .git)
    echo مثال: https://github.com/Username/khedmety-pro.git
    echo.
    set /p REPO_URL=">> ألصق رابط المستودع هنا واضغط Enter: "
    if "%REPO_URL%"=="" (
        echo [تنبيه] لم يتم إدخال رابط!
        pause
        exit /b 1
    )
    "%GIT_EXE%" remote add origin %REPO_URL%
) else (
    echo [1/4] المستودع مرتبط بنجاح.
)

echo.
echo [2/4] تجميع وتجهيز كافة الملفات الـ 68 دفعة واحدة...
"%GIT_EXE%" add .

echo.
echo [3/4] إنشاء نقطة الحفظ المعتمدة (Commit)...
"%GIT_EXE%" commit -m "تحديث شامل ونهائي لملفات خدمتي برو"

echo.
echo [4/4] رفع وتحديث المستودع على GitHub دفعة واحدة...
"%GIT_EXE%" push -u origin main --force

if %ERRORLEVEL% equ 0 (
    echo.
    echo ================================================================
    echo  🎉 مبروك! تم تحديث كامل المستودع على GitHub بنجاح تام دفعة واحدة!
    echo ================================================================
) else (
    echo.
    echo ================================================================
    echo  إذا طلب منك GitHub كلمة مرور:
    echo  استخدم GitHub Personal Access Token من إعدادات حسابك على GitHub.
    echo ================================================================
)

echo.
pause