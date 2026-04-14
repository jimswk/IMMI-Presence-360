// ============================================
// API CONFIGURATION - IMMI PRESENCE 360
// VERSION: 5.3 (With Force Update + Web Block + Native Bridge)
// LAST UPDATED: 14 April 2026
// ============================================

const CONFIG = {
    API_BASE_URL: 'https://script.google.com/macros/s/AKfycbwXKIM8LMK9c93r4wFHEA2grIaF7T87FSexUALcH8KgfOD5GRgzxPwt-bTXwYm4vWhvNw/exec'
};

// Google Drive Folder ID untuk penyimpanan fail
const DRIVE_FOLDER_ID = '1MIGgknZhgw594XgeSetALOpdiMW5VVak';

// Maximum hours for Kebenaran Keluar Pejabat
const MAX_OUT_OF_OFFICE_HOURS = 4;

// APK Configuration
const APK_DOWNLOAD_URL = 'https://github.com/jimswk/IMMI-Presence-360/releases/latest/download/app-release.apk';
const MIN_REQUIRED_ANDROID_VERSION = '1.0.8';

// ============================================
// CORE API FUNCTIONS
// ============================================

async function callAPI(method, params = {}) {
    let url = CONFIG.API_BASE_URL + '?method=' + encodeURIComponent(method);
    
    Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
            let value = params[key];
            if (typeof value === 'object') {
                value = JSON.stringify(value);
            }
            url += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(value);
        }
    });
    
    url += '&_=' + new Date().getTime();
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
        
        const text = await response.text();
        
        if (!text || text.trim() === '') {
            return { success: false, error: 'Empty response from server' };
        }
        
        return JSON.parse(text);
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, error: error.toString() };
    }
}

// ============================================
// NATIVE ANDROID BRIDGE
// ============================================

function getNativeAppVersion() {
    // Check if running in Android WebView with our interface
    if (typeof Android !== 'undefined' && Android && Android.getAppVersion) {
        try {
            const version = Android.getAppVersion();
            console.log('Native Android version detected:', version);
            return version;
        } catch(e) {
            console.error('Failed to get Android version:', e);
            return null;
        }
    }
    
    // Check for custom user agent
    const userAgent = navigator.userAgent;
    if (userAgent.includes('IMMI-Presence-360')) {
        const match = userAgent.match(/IMMI-Presence-360\/([\d.]+)/);
        if (match && match[1]) {
            console.log('Version from UserAgent:', match[1]);
            return match[1];
        }
    }
    
    // Check localStorage (for testing)
    const storedVersion = localStorage.getItem('appVersion');
    if (storedVersion) {
        console.log('Version from localStorage:', storedVersion);
        return storedVersion;
    }
    
    return null;
}

function openDownloadUrl(url) {
    if (typeof Android !== 'undefined' && Android && Android.openDownloadUrl) {
        Android.openDownloadUrl(url);
    } else {
        window.open(url, '_blank');
    }
}

function closeApp() {
    if (typeof Android !== 'undefined' && Android && Android.closeApp) {
        Android.closeApp();
    } else {
        alert('Sila tutup aplikasi dan buka semula selepas update.');
    }
}

// ============================================
// FORCE UPDATE & WEB BLOCK FUNCTIONS
// ============================================

async function checkForAppUpdate(currentVersion) {
    const result = await callAPI('checkForAppUpdate', {
        userAgent: navigator.userAgent,
        currentVersion: currentVersion
    });
    return result;
}

async function getApkDownloadInfo() {
    const result = await callAPI('getApkDownloadInfo');
    return result;
}

function showForceUpdateDialog(downloadUrl, latestVersion, currentVersion) {
    document.body.innerHTML = `
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 20px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">
            <div style="background: white; border-radius: 32px; padding: 40px; max-width: 400px; width: 90%; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);">
                <div style="width: 80px; height: 80px; background: #fef3c7; border-radius: 40px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                    <span style="font-size: 48px;">📱⚠️</span>
                </div>
                <h2 style="margin: 0 0 12px; font-size: 24px; font-weight: 800; color: #1e293b;">Kemas Kini WAJIB!</h2>
                <p style="color: #dc2626; margin-bottom: 20px; line-height: 1.5; font-weight: 600;">
                    Versi aplikasi anda (${currentVersion || 'unknown'}) sudah TIDAK DISOKONG.
                </p>
                <div style="background: #f1f5f9; padding: 16px; border-radius: 20px; margin: 20px 0;">
                    <p style="color: #475569; font-size: 14px;">
                        <span style="font-weight: 700;">✅ Versi terkini: ${latestVersion}</span><br>
                        <span style="font-weight: 700;">⚠️ Versi anda: ${currentVersion || 'unknown'}</span>
                    </p>
                    <p style="color: #475569; font-size: 13px; margin-top: 12px;">
                        Anda TIDAK akan dapat mengakses sistem sehingga<br>
                        mengemas kini aplikasi ke versi terkini.
                    </p>
                </div>
                <button onclick="openDownloadUrl('${downloadUrl}')" style="
                    width: 100%;
                    background: #1e3a8a;
                    color: white;
                    border: none;
                    padding: 16px;
                    border-radius: 24px;
                    font-size: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    margin-bottom: 12px;
                ">
                    📥 Muat Turun Sekarang
                </button>
                <button onclick="closeApp()" style="
                    width: 100%;
                    background: #e2e8f0;
                    color: #475569;
                    border: none;
                    padding: 12px;
                    border-radius: 24px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                ">
                    Tutup Aplikasi
                </button>
                <p style="font-size: 11px; color: #94a3b8; margin-top: 16px;">
                    Jika muat turun tidak bermula, <a href="${downloadUrl}" style="color: #1e3a8a;">klik di sini</a>
                </p>
            </div>
        </div>
    `;
    
    // Disable back button
    history.pushState(null, null, location.href);
    window.onpopstate = function() {
        history.pushState(null, null, location.href);
    };
}

function showAndroidWebBlockedDialog(downloadUrl) {
    document.body.innerHTML = `
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 20px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">
            <div style="background: white; border-radius: 32px; padding: 40px; max-width: 400px; width: 90%; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);">
                <div style="width: 80px; height: 80px; background: #fee2e2; border-radius: 40px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                    <span style="font-size: 48px;">🚫</span>
                </div>
                <h2 style="margin: 20px 0 10px; font-size: 24px; font-weight: 800; color: #1e293b;">Akses Tidak Dibenarkan</h2>
                <p style="color: #64748b; margin-bottom: 24px; line-height: 1.5;">
                    <strong>Sila gunakan Aplikasi Android IMMI Presence 360</strong><br>
                    untuk akses sistem.
                </p>
                <div style="background: #f0fdf4; padding: 16px; border-radius: 20px; margin: 20px 0;">
                    <p style="color: #166534; font-size: 14px; font-weight: 600;">📱 Muat Turun Aplikasi</p>
                    <a href="${downloadUrl}" style="display: inline-block; margin-top: 12px; background: #059669; color: white; text-decoration: none; padding: 12px 24px; border-radius: 30px; font-weight: 700;">
                        Klik untuk Muat Turun
                    </a>
                </div>
                <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">
                    Versi web hanya untuk pengguna iOS dan Desktop.<br>
                    Jika anda sudah memasang aplikasi, sila buka dari aplikasi.
                </p>
            </div>
        </div>
    `;
}

async function checkAndBlockAndroidWeb() {
    if (!isAndroidDevice()) return false;
    if (isFromNativeApp()) return false;
    
    try {
        const result = await callAPI('checkForAppUpdate', {
            userAgent: navigator.userAgent,
            currentVersion: null
        });
        
        if (!result.success && result.code === 'ANDROID_WEB_BLOCKED') {
            showAndroidWebBlockedDialog(result.downloadUrl || APK_DOWNLOAD_URL);
            return true;
        }
    } catch (error) {
        console.error('Check web block error:', error);
        showAndroidWebBlockedDialog(APK_DOWNLOAD_URL);
        return true;
    }
    
    return false;
}

async function checkVersionOnStartup() {
    const appVersion = getNativeAppVersion();
    console.log('App version on startup:', appVersion);
    
    if (!appVersion && isAndroidDevice()) {
        console.warn('No app version detected on Android!');
    }
    
    if (appVersion && isAndroidDevice()) {
        try {
            const result = await callAPI('checkForAppUpdate', {
                userAgent: navigator.userAgent,
                currentVersion: appVersion
            });
            
            if (result.success && result.needsUpdate) {
                console.log('Update needed on startup!');
                showForceUpdateDialog(result.downloadUrl, result.latestVersion, appVersion);
                return false;
            }
        } catch(e) {
            console.error('Version check failed:', e);
        }
    }
    
    return true;
}

// ============================================
// PLATFORM DETECTION
// ============================================

function isAndroidDevice() {
    return /android/i.test(navigator.userAgent);
}

function isIOSDevice() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isDesktopDevice() {
    const ua = navigator.userAgent;
    const isMobile = /mobile|android|iphone|ipad|ipod/i.test(ua);
    return !isMobile;
}

function isFromNativeApp() {
    return navigator.userAgent.includes('IMMI-Android-App') || 
           navigator.userAgent.includes('IMMI-Presence-360') ||
           typeof Android !== 'undefined';
}

// ============================================
// DEVICE MODEL DETECTION
// ============================================

function detectDeviceModel(userAgent) {
    let deviceModel = 'Unknown';
    let brand = 'Unknown';
    
    if (/iPhone/i.test(userAgent)) {
        brand = 'Apple';
        const modelMatches = {
            'iPhone17,1': 'iPhone 16 Pro', 'iPhone17,2': 'iPhone 16 Pro Max',
            'iPhone17,3': 'iPhone 16', 'iPhone17,4': 'iPhone 16 Plus',
            'iPhone16,1': 'iPhone 15 Pro', 'iPhone16,2': 'iPhone 15 Pro Max',
            'iPhone16,3': 'iPhone 15', 'iPhone16,4': 'iPhone 15 Plus',
            'iPhone15,2': 'iPhone 14 Pro', 'iPhone15,3': 'iPhone 14 Pro Max',
            'iPhone15,4': 'iPhone 14', 'iPhone15,5': 'iPhone 14 Plus',
            'iPhone14,5': 'iPhone 13', 'iPhone14,2': 'iPhone 13 Pro',
            'iPhone14,3': 'iPhone 13 Pro Max', 'iPhone14,4': 'iPhone 13 mini',
            'iPhone13,2': 'iPhone 12', 'iPhone13,3': 'iPhone 12 Pro',
            'iPhone13,4': 'iPhone 12 Pro Max', 'iPhone13,1': 'iPhone 12 mini',
            'iPhone12,1': 'iPhone 11', 'iPhone12,3': 'iPhone 11 Pro',
            'iPhone12,5': 'iPhone 11 Pro Max'
        };
        
        for (var identifier in modelMatches) {
            if (userAgent.includes(identifier)) {
                deviceModel = modelMatches[identifier];
                break;
            }
        }
        if (deviceModel === 'Unknown') deviceModel = 'iPhone';
    } 
    else if (/iPad/i.test(userAgent)) {
        brand = 'Apple';
        deviceModel = 'iPad';
    }
    else if (/Android/i.test(userAgent)) {
        const modelMatch = userAgent.match(/; ([\w\s]+?) Build/);
        if (modelMatch && modelMatch[1]) {
            deviceModel = modelMatch[1].trim();
        }
        
        if (userAgent.includes('SM-')) brand = 'Samsung';
        else if (userAgent.includes('Pixel')) brand = 'Google';
        else if (userAgent.includes('Redmi') || userAgent.includes('Mi ')) brand = 'Xiaomi';
        else if (userAgent.includes('OPPO')) brand = 'OPPO';
        else if (userAgent.includes('vivo')) brand = 'vivo';
        else if (userAgent.includes('OnePlus')) brand = 'OnePlus';
        else brand = 'Android';
    }
    else if (/Macintosh|Mac OS X/i.test(userAgent)) {
        brand = 'Apple';
        deviceModel = 'Mac';
    }
    else if (/Windows NT/i.test(userAgent)) {
        brand = 'Microsoft';
        deviceModel = 'Windows PC';
    }
    
    return { deviceModel, brand };
}

// ============================================
// CANVAS & WEBGL FINGERPRINT
// ============================================

function getCanvasFingerprint() {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 50;
        
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#f60';
        ctx.fillRect(0, 0, 100, 50);
        ctx.fillStyle = '#069';
        ctx.fillText('IMMI Presence 360', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillRect(100, 0, 100, 50);
        ctx.fillStyle = '#f0f';
        ctx.fillText('✓', 150, 25);
        
        ctx.beginPath();
        ctx.arc(50, 35, 10, 0, 2 * Math.PI);
        ctx.fillStyle = '#ff0';
        ctx.fill();
        
        return canvas.toDataURL();
    } catch(e) {
        return 'canvas_not_supported';
    }
}

function getWebGLFingerprint() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return 'webgl_not_supported';
        
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            return `${vendor}|${renderer}`;
        }
        return 'webgl_no_debug_info';
    } catch(e) {
        return 'webgl_error';
    }
}

// ============================================
// DETAILED DEVICE INFO
// ============================================

async function getDetailedDeviceInfo() {
    const userAgent = navigator.userAgent;
    const { deviceModel, brand } = detectDeviceModel(userAgent);
    
    const screenDetails = {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth,
        pixelRatio: window.devicePixelRatio || 1,
        orientation: screen.orientation ? screen.orientation.type : 'unknown'
    };
    
    let batteryInfo = null;
    if (navigator.getBattery) {
        try {
            const battery = await navigator.getBattery();
            batteryInfo = {
                level: battery.level,
                charging: battery.charging
            };
        } catch(e) {}
    }
    
    const canvasFingerprint = getCanvasFingerprint();
    const webglFingerprint = getWebGLFingerprint();
    
    return {
        userAgent: userAgent,
        platform: navigator.platform,
        language: navigator.language,
        languages: navigator.languages ? navigator.languages.join(',') : '',
        hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
        deviceMemory: navigator.deviceMemory || 'unknown',
        maxTouchPoints: navigator.maxTouchPoints || 0,
        screenResolution: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        pixelRatio: window.devicePixelRatio,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        deviceModel: deviceModel,
        brand: brand,
        screenDetails: screenDetails,
        batteryInfo: batteryInfo,
        canvasFingerprint: canvasFingerprint,
        webglFingerprint: webglFingerprint
    };
}

// ============================================
// GENERATE STRONG DEVICE ID
// ============================================

async function generateStrongDeviceId() {
    const deviceInfo = await getDetailedDeviceInfo();
    
    const fingerprintParts = [
        deviceInfo.userAgent,
        deviceInfo.screenResolution,
        deviceInfo.colorDepth,
        deviceInfo.pixelRatio,
        deviceInfo.timezone,
        deviceInfo.language,
        deviceInfo.hardwareConcurrency,
        deviceInfo.deviceMemory,
        deviceInfo.maxTouchPoints,
        deviceInfo.deviceModel,
        deviceInfo.brand,
        deviceInfo.canvasFingerprint,
        deviceInfo.webglFingerprint
    ].join('|');
    
    let hash = 0;
    for (let i = 0; i < fingerprintParts.length; i++) {
        const char = fingerprintParts.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    
    const primaryId = Math.abs(hash).toString(16);
    const modelSuffix = deviceInfo.deviceModel.replace(/[^a-zA-Z0-9]/g, '').substring(0, 15);
    const brandPrefix = deviceInfo.brand.substring(0, 5);
    
    let deviceId = primaryId;
    if (brandPrefix !== 'Unknown' && brandPrefix !== '') {
        deviceId = `${primaryId}_${brandPrefix}`;
    }
    if (modelSuffix && modelSuffix !== 'Unknown' && modelSuffix !== '') {
        deviceId = `${deviceId}_${modelSuffix}`;
    }
    
    return {
        deviceId: deviceId,
        deviceModel: deviceInfo.deviceModel,
        brand: deviceInfo.brand,
        platform: deviceInfo.platform,
        screenResolution: deviceInfo.screenResolution,
        fingerprintDetails: deviceInfo
    };
}

// ============================================
// GET DEVICE INFO (MAIN FUNCTION)
// ============================================

async function getDeviceInfo() {
    const strongId = await generateStrongDeviceId();
    const userAgent = navigator.userAgent;
    const { deviceModel, brand } = detectDeviceModel(userAgent);
    
    let platform = 'Web';
    let deviceName = deviceModel || 'Desktop Browser';
    
    if (isAndroidDevice()) {
        platform = 'Android';
        deviceName = deviceModel || 'Android Device';
    } else if (isIOSDevice()) {
        platform = 'iOS';
        deviceName = deviceModel || 'iPhone/iPad';
    } else if (isDesktopDevice()) {
        platform = 'Desktop';
        deviceName = deviceModel || (navigator.platform.includes('Mac') ? 'Mac' : 'Windows PC');
    }
    
    return {
        deviceId: strongId.deviceId,
        deviceName: deviceName,
        deviceModel: deviceModel,
        brand: brand,
        platform: platform,
        userAgent: userAgent,
        screenResolution: strongId.screenResolution,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
        deviceMemory: navigator.deviceMemory || 'unknown'
    };
}

// ============================================
// IP LOCATION FUNCTIONS
// ============================================

async function getIPLocation() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data && data.latitude && data.longitude) {
            return {
                success: true,
                ip: data.ip,
                city: data.city,
                region: data.region,
                country: data.country_name,
                postal: data.postal,
                lat: data.latitude,
                lng: data.longitude,
                org: data.org,
                timezone: data.timezone
            };
        }
        return { success: false, error: 'Invalid response from ipapi' };
    } catch (error) {
        console.error('IP geolocation error:', error);
        return { success: false, error: error.toString() };
    }
}

async function saveMyLocation() {
    try {
        const ipLocation = await getIPLocation();
        if (!ipLocation.success) {
            console.warn('Failed to get IP location:', ipLocation.error);
            return { success: false, error: ipLocation.error };
        }
        
        const deviceInfo = await getDeviceInfo();
        
        const ipData = {
            ip: ipLocation.ip,
            userAgent: deviceInfo.userAgent
        };
        
        const locationData = {
            city: ipLocation.city,
            region: ipLocation.region,
            country: ipLocation.country,
            lat: ipLocation.lat,
            lng: ipLocation.lng,
            postal: ipLocation.postal
        };
        
        const currentUserStr = localStorage.getItem('currentUser');
        if (!currentUserStr) return { success: false, error: 'No user logged in' };
        
        const currentUser = JSON.parse(currentUserStr);
        
        return await callAPI('saveUserIPLocation', {
            uid: currentUser.uid,
            ipData: JSON.stringify(ipData),
            locationData: JSON.stringify(locationData),
            source: deviceInfo.platform
        });
    } catch (error) {
        console.error('Save location error:', error);
        return { success: false, error: error.toString() };
    }
}

let locationTrackingInterval = null;

function startPeriodicLocationTracking() {
    if (locationTrackingInterval) {
        clearInterval(locationTrackingInterval);
    }
    
    saveMyLocation();
    
    locationTrackingInterval = setInterval(async () => {
        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr) {
            await saveMyLocation();
            console.log('Periodic location saved at', new Date().toLocaleTimeString());
        }
    }, 5 * 60 * 1000);
}

function stopPeriodicLocationTracking() {
    if (locationTrackingInterval) {
        clearInterval(locationTrackingInterval);
        locationTrackingInterval = null;
    }
}

// ============================================
// AUTHENTICATION FUNCTIONS (UPDATED)
// ============================================

async function login(email, password) {
    return await callAPI('login', { email: email, password: password });
}

async function userLogin(email, password) {
    const deviceInfo = await getDeviceInfo();
    const appVersion = getNativeAppVersion();
    
    console.log('=== USER LOGIN ===');
    console.log('Email:', email);
    console.log('App Version from native:', appVersion);
    console.log('Platform:', deviceInfo.platform);
    
    if (isAndroidDevice() && !appVersion) {
        console.error('ERROR: Android device but no app version!');
        showAlert('Ralat', 'Versi aplikasi tidak dapat dikesan. Sila muat turun versi terkini.', 'error');
        return { 
            success: false, 
            error: 'Versi aplikasi tidak dikesan',
            code: 'NO_VERSION_DETECTED',
            isForceUpdate: true,
            downloadUrl: APK_DOWNLOAD_URL
        };
    }
    
    const result = await callAPI('userLogin', { 
        email: email, 
        password: password,
        userAgent: deviceInfo.userAgent,
        platform: deviceInfo.platform,
        screenResolution: deviceInfo.screenResolution,
        timezone: deviceInfo.timezone,
        language: deviceInfo.language,
        hardwareConcurrency: deviceInfo.hardwareConcurrency,
        deviceMemory: deviceInfo.deviceMemory,
        appVersion: appVersion,
        deviceModel: deviceInfo.deviceModel,
        brand: deviceInfo.brand,
        deviceId: deviceInfo.deviceId
    });
    
    console.log('Login result:', result);
    
    if (!result.success && result.isForceUpdate) {
        console.log('Force update required!');
        showForceUpdateDialog(
            result.downloadUrl, 
            result.latestVersion, 
            result.currentVersion || appVersion
        );
        return result;
    }
    
    if (!result.success && result.code === 'ANDROID_WEB_BLOCKED') {
        showAndroidWebBlockedDialog(result.downloadUrl);
        return result;
    }
    
    return result;
}

// ============================================
// ADMIN MANAGEMENT
// ============================================

async function getAdmins(requestingUser) {
    return await callAPI('getAdmins', { requestingUser: JSON.stringify(requestingUser) });
}

async function createAdmin(data, requestingUser) {
    return await callAPI('createAdmin', { 
        data: JSON.stringify(data),
        requestingUser: JSON.stringify(requestingUser)
    });
}

async function updateAdmin(data, requestingUser) {
    return await callAPI('updateAdmin', { 
        data: JSON.stringify(data),
        requestingUser: JSON.stringify(requestingUser)
    });
}

async function deleteAdmin(data, requestingUser) {
    return await callAPI('deleteAdmin', { 
        data: JSON.stringify(data),
        requestingUser: JSON.stringify(requestingUser)
    });
}

// ============================================
// USER MANAGEMENT
// ============================================

async function getAllUsers(requestingUser) {
    return await callAPI('getAllUsers', { requestingUser: JSON.stringify(requestingUser) });
}

async function getUsers(branch, unit, requestingUser) {
    return await callAPI('getUsers', { 
        branch: branch, 
        unit: unit,
        requestingUser: JSON.stringify(requestingUser)
    });
}

async function createUser(data, requestingUser) {
    return await callAPI('createUser', { 
        data: JSON.stringify(data),
        requestingUser: JSON.stringify(requestingUser)
    });
}

async function updateUser(data, requestingUser) {
    return await callAPI('updateUser', { 
        data: JSON.stringify(data),
        requestingUser: JSON.stringify(requestingUser)
    });
}

async function deleteUser(data, requestingUser) {
    return await callAPI('deleteUser', { 
        data: JSON.stringify(data),
        requestingUser: JSON.stringify(requestingUser)
    });
}

async function updateUserFace(uid, faceDescriptor) {
    return await callAPI('updateUserFace', { uid: uid, faceDescriptor: faceDescriptor });
}

// ============================================
// ATTENDANCE FUNCTIONS
// ============================================

async function getAttendance(uid, startDate, endDate, requestingUser = null) {
    const params = { uid: uid, startDate: startDate, endDate: endDate };
    if (requestingUser && (requestingUser.role === 'admin' || requestingUser.role === 'superadmin')) {
        params.requestingUser = JSON.stringify(requestingUser);
    }
    return await callAPI('getAttendance', params);
}

async function getAttendanceWithRemarks(uid, startDate, endDate, requestingUser = null) {
    const params = { uid: uid, startDate: startDate, endDate: endDate };
    if (requestingUser && (requestingUser.role === 'admin' || requestingUser.role === 'superadmin')) {
        params.requestingUser = JSON.stringify(requestingUser);
    }
    return await callAPI('getAttendanceWithRemarks', params);
}

async function clockIn(uid, location, user) {
    return await callAPI('clockIn', {
        uid: uid,
        location: JSON.stringify(location),
        clientIP: await getClientIP()
    });
}

async function clockOut(uid, location, user) {
    return await callAPI('clockOut', {
        uid: uid,
        location: JSON.stringify(location),
        clientIP: await getClientIP()
    });
}

async function getClientIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return 'unknown';
    }
}

// ============================================
// MONITORING FUNCTIONS
// ============================================

async function getAllUserLocations(requestingUser) {
    return await callAPI('getAllUserLocations', { requestingUser: JSON.stringify(requestingUser) });
}

async function forceLogoutUser(uid, requestingUser) {
    return await callAPI('forceLogoutUser', { uid: uid, requestingUser: JSON.stringify(requestingUser) });
}

// ============================================
// EMAIL FUNCTIONS
// ============================================

async function sendEmail(to, subject, body) {
    return await callAPI('sendEmail', { to: to, subject: subject, body: body });
}

// ============================================
// BLOCKED USERS MANAGEMENT
// ============================================

async function getBlockedUsers(requestingUser) {
    return await callAPI('getBlockedUsers', { requestingUser: JSON.stringify(requestingUser) });
}

async function reactivateUser(uid, requestingUser) {
    return await callAPI('reactivateUser', { uid: uid, requestingUser: JSON.stringify(requestingUser) });
}

async function autoBlockInactiveUsers() {
    return await callAPI('autoBlockInactiveUsers');
}

// ============================================
// STEP COUNTER FUNCTIONS (Android Only)
// ============================================

async function saveStepCount(uid, stepCount) {
    return await callAPI('saveStepCount', { uid: uid, stepCount: stepCount });
}

async function getLastStepCount(uid) {
    return await callAPI('getLastStepCount', { uid: uid });
}

async function validateStepCount(uid, currentStepCount) {
    return await callAPI('validateStepCount', { uid: uid, currentStepCount: currentStepCount });
}

async function confirmOvertime(uid, status) {
    return await callAPI('confirmOvertime', { uid: uid, status: status });
}

// ============================================
// DEVICE REPLACEMENT FUNCTIONS
// ============================================

async function requestDeviceReplacement(uid, newDeviceId, reason) {
    return await callAPI('requestDeviceReplacement', {
        uid: uid,
        newDeviceId: newDeviceId,
        reason: reason
    });
}

async function getPendingDeviceRequests(requestingUser) {
    return await callAPI('getPendingDeviceRequests', { requestingUser: JSON.stringify(requestingUser) });
}

async function approveDeviceReplacement(requestId, requestingUser) {
    return await callAPI('approveDeviceReplacement', {
        requestId: requestId,
        requestingUser: JSON.stringify(requestingUser)
    });
}

async function rejectDeviceReplacement(requestId, reason, requestingUser) {
    return await callAPI('rejectDeviceReplacement', {
        requestId: requestId,
        reason: reason,
        requestingUser: JSON.stringify(requestingUser)
    });
}

// ============================================
// LOCATION OFF TRACKING
// ============================================

async function reportLocationOff(uid, duration) {
    return await callAPI('reportLocationOff', { uid: uid, duration: duration });
}

async function getLocationOffLogs(requestingUser, startDate, endDate) {
    return await callAPI('getLocationOffLogs', {
        requestingUser: JSON.stringify(requestingUser),
        startDate: startDate,
        endDate: endDate
    });
}

// ============================================
// TODAY ATTENDANCE WITH COLOR
// ============================================

async function getTodayAttendanceWithColor(uid, date) {
    return await callAPI('getTodayAttendanceWithColor', { uid: uid, date: date });
}

// ============================================
// DIARY EXEMPT CHECK
// ============================================

async function isExemptFromAttendance(uid, date) {
    return await callAPI('isExemptFromAttendance', { uid: uid, date: date });
}

// ============================================
// EXCEPTION REPORT FUNCTIONS
// ============================================

async function submitException(uid, userName, date, reason, fileUrl) {
    return await callAPI('submitException', {
        uid: uid,
        userName: userName,
        date: date,
        reason: reason,
        fileUrl: fileUrl
    });
}

async function getPendingExceptions(requestingUser) {
    return await callAPI('getPendingExceptions', { requestingUser: JSON.stringify(requestingUser) });
}

async function updateExceptionStatus(exceptionId, status, adminResponse) {
    return await callAPI('updateExceptionStatus', {
        exceptionId: exceptionId,
        status: status,
        adminResponse: adminResponse
    });
}

// ============================================
// LEAVE REQUEST FUNCTIONS
// ============================================

async function submitLeaveRequest(uid, userName, type, startDate, endDate, reason, fileUrl) {
    if (type === 'out_of_office') {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const hoursRequested = (end - start) / (1000 * 60 * 60);
        
        if (hoursRequested > MAX_OUT_OF_OFFICE_HOURS) {
            return { 
                success: false, 
                error: `Kebenaran keluar pejabat maksimum ${MAX_OUT_OF_OFFICE_HOURS} jam sahaja.\n\nTempoh dimohon: ${hoursRequested.toFixed(1)} jam\n\nSila mohon CUTI REHAT untuk tempoh lebih lama.` 
            };
        }
    }
    
    return await callAPI('submitLeaveRequest', {
        uid: uid,
        userName: userName,
        type: type,
        startDate: startDate,
        endDate: endDate,
        reason: reason,
        fileUrl: fileUrl
    });
}

async function getPendingLeaveRequests(requestingUser) {
    return await callAPI('getPendingLeaveRequests', { requestingUser: JSON.stringify(requestingUser) });
}

async function getUserLeaveRequests(uid) {
    return await callAPI('getUserLeaveRequests', { uid: uid });
}

async function updateLeaveRequestStatus(requestId, status, adminResponse) {
    return await callAPI('updateLeaveRequestStatus', {
        requestId: requestId,
        status: status,
        adminResponse: adminResponse
    });
}

// ============================================
// COURSE DIARY FUNCTIONS
// ============================================

async function submitCourseDiary(uid, userName, date, type, title, description, fileUrl) {
    return await callAPI('submitCourseDiary', {
        uid: uid,
        userName: userName,
        date: date,
        type: type,
        title: title,
        description: description,
        fileUrl: fileUrl
    });
}

async function getPendingDiaries(requestingUser) {
    return await callAPI('getPendingDiaries', { requestingUser: JSON.stringify(requestingUser) });
}

async function getUserDiaries(uid) {
    return await callAPI('getUserDiaries', { uid: uid });
}

async function updateDiaryStatus(diaryId, status, adminNotes) {
    return await callAPI('updateDiaryStatus', {
        diaryId: diaryId,
        status: status,
        adminNotes: adminNotes
    });
}

// ============================================
// INBOX FUNCTIONS
// ============================================

async function getUserInbox(uid) {
    return await callAPI('getUserInbox', { uid: uid });
}

async function markInboxAsRead(inboxId, uid) {
    return await callAPI('markInboxAsRead', { inboxId: inboxId, uid: uid });
}

async function sendToInbox(uid, title, message, type, referenceId, status) {
    return await callAPI('sendToInbox', {
        uid: uid,
        title: title,
        message: message,
        type: type,
        referenceId: referenceId,
        status: status
    });
}

// ============================================
// GET ALL PENDING REQUESTS (ADMIN)
// ============================================

async function getAllPendingRequests(requestingUser) {
    return await callAPI('getAllPendingRequests', { requestingUser: JSON.stringify(requestingUser) });
}

// ============================================
// UPLOAD FILE TO GOOGLE DRIVE
// ============================================

async function uploadFileToDrive(fileName, fileBase64, folderId, mimeType) {
    return await callAPI('uploadFileToDrive', {
        fileName: fileName,
        fileBase64: fileBase64,
        folderId: folderId || DRIVE_FOLDER_ID,
        mimeType: mimeType
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

async function setupSheets() {
    return await callAPI('setupSheets');
}

async function runMigration() {
    return await callAPI('runMigration');
}

async function fixInconsistentData() {
    return await callAPI('fixInconsistentData');
}

async function recalculateOvertime(startDate, endDate) {
    return await callAPI('recalculateOvertime', { startDate: startDate, endDate: endDate });
}

async function resetTodayAttendance(data) {
    return await callAPI('resetTodayAttendance', { uid: data.uid, date: data.date });
}

async function getCurrentIPLocation() {
    return await getIPLocation();
}

// ============================================
// CRASH REPORT FUNCTIONS (Emergency)
// ============================================

async function reportCrash(crashData) {
    return await callAPI('report_crash', crashData);
}

async function getActiveEmergency(uid) {
    return await callAPI('getActiveEmergency', { uid: uid });
}

async function updateEmergencyStatus(uid, reportId, status) {
    return await callAPI('updateEmergencyStatus', {
        uid: uid,
        reportId: reportId,
        status: status
    });
}

async function getNearbyCrashes(latitude, longitude, radius, hours) {
    return await callAPI('get_nearby_crashes', {
        latitude: latitude,
        longitude: longitude,
        radius: radius,
        hours: hours
    });
}

async function confirmRescue(rescueData) {
    return await callAPI('confirm_rescue', rescueData);
}

async function getAllCrashReports(requestingUser) {
    return await callAPI('getAllCrashReports', { requestingUser: JSON.stringify(requestingUser) });
}

// ============================================
// EMERGENCY CONTACT FUNCTIONS
// ============================================

async function addEmergencyContact(data, requestingUser) {
    return await callAPI('addEmergencyContact', {
        data: JSON.stringify(data),
        requestingUser: JSON.stringify(requestingUser)
    });
}

async function getEmergencyContacts(uid, requestingUser) {
    return await callAPI('getEmergencyContacts', {
        uid: uid,
        requestingUser: JSON.stringify(requestingUser)
    });
}

async function deleteEmergencyContact(uid, contactEmail, requestingUser) {
    return await callAPI('deleteEmergencyContact', {
        uid: uid,
        contactEmail: contactEmail,
        requestingUser: JSON.stringify(requestingUser)
    });
}

// ============================================
// AUDIT LOG FUNCTIONS
// ============================================

async function getAuditLogs(requestingUser, filters) {
    return await callAPI('getAuditLogs', {
        requestingUser: JSON.stringify(requestingUser),
        filters: filters ? JSON.stringify(filters) : null
    });
}

// ============================================
// DEBUG FUNCTIONS
// ============================================

async function debugDeviceInfo() {
    console.log('=== DEVICE FINGERPRINT DEBUG ===');
    const deviceInfo = await getDeviceInfo();
    console.log('Device Info:', deviceInfo);
    const detailedInfo = await getDetailedDeviceInfo();
    console.log('Detailed Device Info:', detailedInfo);
    return { device: deviceInfo, detailed: detailedInfo };
}

// ============================================
// INITIALIZATION
// ============================================

console.log('✅ api-config.js v5.3 loaded - With Force Update & Native Bridge');

// Run check on page load
window.addEventListener('DOMContentLoaded', async () => {
    const canProceed = await checkVersionOnStartup();
    if (!canProceed) return;
    
    if (isAndroidDevice() && !isFromNativeApp()) {
        await checkAndBlockAndroidWeb();
    }
});

