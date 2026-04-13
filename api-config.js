// ============================================
// API CONFIGURATION - IMMI PRESENCE 360
// VERSION: 5.1 (With Force Update + Web Block)
// LAST UPDATED: 14 April 2026
// ============================================

const CONFIG = {
    API_BASE_URL: 'https://script.google.com/macros/s/AKfycbwXKIM8LMK9c93r4wFHEA2grIaF7T87FSexUALcH8KgfOD5GRgzxPwt-bTXwYm4vWhvNw/exec'
};

// Google Drive Folder ID untuk penyimpanan fail
const DRIVE_FOLDER_ID = '1MIGgknZhgw594XgeSetALOpdiMW5VVak';

// Maximum hours for Kebenaran Keluar Pejabat
const MAX_OUT_OF_OFFICE_HOURS = 4;

// APK Configuration (untuk force update)
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
// FORCE UPDATE & WEB BLOCK FUNCTIONS
// ============================================

/**
 * Check if current app version needs update
 */
async function checkForAppUpdate(currentVersion) {
    try {
        const result = await callAPI('checkForAppUpdate', {
            userAgent: navigator.userAgent,
            currentVersion: currentVersion
        });
        return result;
    } catch (error) {
        console.error('Check update error:', error);
        return { success: false, error: error.toString() };
    }
}

/**
 * Get APK download info from server
 */
async function getApkDownloadInfo() {
    try {
        const result = await callAPI('getApkDownloadInfo');
        return result;
    } catch (error) {
        console.error('Get APK info error:', error);
        return { 
            success: false, 
            downloadUrl: APK_DOWNLOAD_URL,
            version: MIN_REQUIRED_ANDROID_VERSION,
            error: error.toString()
        };
    }
}

/**
 * Show force update dialog to Android user
 */
function showForceUpdateDialog(downloadUrl, latestVersion, currentVersion) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        backdrop-filter: blur(8px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    `;
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: white;
        border-radius: 32px;
        padding: 32px;
        max-width: 400px;
        width: 90%;
        text-align: center;
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
    `;
    
    dialog.innerHTML = `
        <div style="width: 80px; height: 80px; background: #fef3c7; border-radius: 40px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
            <span style="font-size: 48px;">📱</span>
        </div>
        <h2 style="margin: 0 0 12px; font-size: 24px; font-weight: 800; color: #1e293b;">Kemas Kini Diperlukan</h2>
        <p style="color: #64748b; margin-bottom: 20px; line-height: 1.5;">
            Versi aplikasi anda (${currentVersion}) sudah lama.<br>
            Sila kemas kini ke versi ${latestVersion} untuk terus menggunakan sistem.
        </p>
        <div style="background: #f1f5f9; padding: 12px; border-radius: 16px; margin: 20px 0;">
            <p style="color: #475569; font-size: 14px;">
                <span style="font-weight: 700;">⚡ Perubahan dalam versi baru:</span><br>
                • Penambahbaikan prestasi<br>
                • Pembetulan isu GPS<br>
                • Peningkatan keselamatan
            </p>
        </div>
        <button onclick="window.location.href='${downloadUrl}'" style="
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
        <button onclick="window.location.reload()" style="
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
            Cuba Semula
        </button>
        <p style="font-size: 11px; color: #94a3b8; margin-top: 16px;">
            Jika muat turun tidak bermula, <a href="${downloadUrl}" style="color: #1e3a8a;">klik di sini</a>
        </p>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    // Make overlay non-removable
    overlay.style.pointerEvents = 'auto';
}

/**
 * Show Android web access blocked dialog
 */
function showAndroidWebBlockedDialog(downloadUrl) {
    document.body.innerHTML = `
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 20px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">
            <div style="background: white; border-radius: 32px; padding: 40px; max-width: 400px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);">
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

// ============================================
// ENHANCED DEVICE MODEL DETECTION
// ============================================

function detectDeviceModel(userAgent) {
    let deviceModel = 'Unknown';
    let brand = 'Unknown';
    let modelFound = false;
    
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
            'iPhone12,5': 'iPhone 11 Pro Max', 'iPhone11,2': 'iPhone XS',
            'iPhone11,4': 'iPhone XS Max', 'iPhone11,6': 'iPhone XS Max',
            'iPhone11,8': 'iPhone XR', 'iPhone10,3': 'iPhone X',
            'iPhone10,6': 'iPhone X', 'iPhone10,1': 'iPhone 8',
            'iPhone10,4': 'iPhone 8', 'iPhone10,2': 'iPhone 8 Plus',
            'iPhone10,5': 'iPhone 8 Plus', 'iPhone9,1': 'iPhone 7',
            'iPhone9,3': 'iPhone 7', 'iPhone9,2': 'iPhone 7 Plus',
            'iPhone9,4': 'iPhone 7 Plus', 'iPhone8,4': 'iPhone SE (1st gen)',
            'iPhone14,6': 'iPhone SE (3rd gen)', 'iPhone7,2': 'iPhone 6',
            'iPhone7,1': 'iPhone 6 Plus', 'iPhone8,1': 'iPhone 6s',
            'iPhone8,2': 'iPhone 6s Plus', 'iPhone5,1': 'iPhone 5',
            'iPhone5,2': 'iPhone 5', 'iPhone5,3': 'iPhone 5c',
            'iPhone5,4': 'iPhone 5c', 'iPhone6,1': 'iPhone 5s',
            'iPhone6,2': 'iPhone 5s', 'iPhone4,1': 'iPhone 4s',
            'iPhone3,1': 'iPhone 4', 'iPhone3,2': 'iPhone 4',
            'iPhone3,3': 'iPhone 4', 'iPhone2,1': 'iPhone 3GS',
            'iPhone1,1': 'iPhone 2G', 'iPhone1,2': 'iPhone 3G'
        };
        
        for (var identifier in modelMatches) {
            if (userAgent.includes(identifier)) {
                deviceModel = modelMatches[identifier];
                modelFound = true;
                break;
            }
        }
        
        if (!modelFound) {
            const deviceMatch = userAgent.match(/iPhone([0-9]+,[0-9]+)/);
            if (deviceMatch && deviceMatch[1]) {
                const deviceCode = 'iPhone' + deviceMatch[1];
                if (modelMatches[deviceCode]) {
                    deviceModel = modelMatches[deviceCode];
                    modelFound = true;
                }
            }
        }
        
        if (!modelFound) {
            const osMatch = userAgent.match(/OS (\d+)_/);
            if (osMatch) {
                const osVersion = parseInt(osMatch[1]);
                if (osVersion >= 18) deviceModel = 'iPhone (iOS 18)';
                else if (osVersion >= 17) deviceModel = 'iPhone (iOS 17)';
                else if (osVersion >= 16) deviceModel = 'iPhone (iOS 16)';
                else deviceModel = 'iPhone';
            } else {
                deviceModel = 'iPhone';
            }
        }
    } 
    else if (/iPad/i.test(userAgent)) {
        brand = 'Apple';
        const iPadMatches = {
            'iPad14,1': 'iPad Pro 11" (4th gen)', 'iPad14,2': 'iPad Pro 12.9" (6th gen)',
            'iPad13,4': 'iPad Pro 11" (3rd gen)', 'iPad13,5': 'iPad Pro 11" (3rd gen)',
            'iPad13,6': 'iPad Pro 11" (3rd gen)', 'iPad13,7': 'iPad Pro 11" (3rd gen)',
            'iPad13,8': 'iPad Pro 12.9" (5th gen)', 'iPad13,9': 'iPad Pro 12.9" (5th gen)',
            'iPad13,10': 'iPad Pro 12.9" (5th gen)', 'iPad13,11': 'iPad Pro 12.9" (5th gen)',
            'iPad12,1': 'iPad (9th gen)', 'iPad12,2': 'iPad (9th gen)',
            'iPad11,6': 'iPad (8th gen)', 'iPad11,7': 'iPad (8th gen)',
            'iPad8,1': 'iPad Pro 11" (1st gen)', 'iPad8,2': 'iPad Pro 11" (1st gen)',
            'iPad8,3': 'iPad Pro 11" (1st gen)', 'iPad8,4': 'iPad Pro 11" (1st gen)',
            'iPad8,5': 'iPad Pro 12.9" (3rd gen)', 'iPad8,6': 'iPad Pro 12.9" (3rd gen)',
            'iPad8,7': 'iPad Pro 12.9" (3rd gen)', 'iPad8,8': 'iPad Pro 12.9" (3rd gen)'
        };
        
        for (var identifier in iPadMatches) {
            if (userAgent.includes(identifier)) {
                deviceModel = iPadMatches[identifier];
                modelFound = true;
                break;
            }
        }
        if (!modelFound) deviceModel = 'iPad';
    }
    else if (/Android/i.test(userAgent)) {
        const modelMatch = userAgent.match(/; ([\w\s]+?) Build/);
        if (modelMatch && modelMatch[1]) {
            let rawModel = modelMatch[1].trim();
            rawModel = rawModel.replace(/ \w+-\w+$/, '');
            rawModel = rawModel.replace(/\(.*?\)/g, '');
            rawModel = rawModel.trim();
            deviceModel = rawModel;
        }
        
        if (userAgent.includes('SM-')) {
            brand = 'Samsung';
            const smMatch = userAgent.match(/SM-[A-Z0-9]+/);
            if (smMatch) {
                const samsungModels = {
                    'SM-S928': 'Galaxy S24 Ultra', 'SM-S926': 'Galaxy S24+',
                    'SM-S921': 'Galaxy S24', 'SM-S918': 'Galaxy S23 Ultra',
                    'SM-S916': 'Galaxy S23+', 'SM-S911': 'Galaxy S23',
                    'SM-S908': 'Galaxy S22 Ultra', 'SM-S906': 'Galaxy S22+',
                    'SM-S901': 'Galaxy S22', 'SM-N986': 'Galaxy Note 20 Ultra',
                    'SM-N981': 'Galaxy Note 20', 'SM-F936': 'Galaxy Z Fold 4',
                    'SM-F946': 'Galaxy Z Fold 5', 'SM-F721': 'Galaxy Z Flip 4',
                    'SM-F731': 'Galaxy Z Flip 5', 'SM-A736': 'Galaxy A73',
                    'SM-A536': 'Galaxy A53', 'SM-A546': 'Galaxy A54',
                    'SM-A556': 'Galaxy A55', 'SM-A336': 'Galaxy A33',
                    'SM-A236': 'Galaxy A23', 'SM-A146': 'Galaxy A14',
                    'SM-A056': 'Galaxy A05'
                };
                let modelCode = smMatch[0].substring(0, 7);
                if (samsungModels[modelCode]) deviceModel = samsungModels[modelCode];
                else deviceModel = smMatch[0];
            }
        }
        else if (userAgent.includes('Pixel')) {
            brand = 'Google';
            const pixelMatch = userAgent.match(/Pixel (\d+)/);
            if (pixelMatch) deviceModel = `Pixel ${pixelMatch[1]}`;
        }
        else if (userAgent.includes('Redmi')) { brand = 'Xiaomi'; }
        else if (userAgent.includes('Mi ')) { brand = 'Xiaomi'; }
        else if (userAgent.includes('POCO')) { brand = 'Xiaomi'; }
        else if (userAgent.includes('RMX')) { brand = 'Realme'; }
        else if (userAgent.includes('VOG') || userAgent.includes('LYA') || userAgent.includes('NOH')) { brand = 'Huawei'; }
        else if (userAgent.includes('OPPO')) { brand = 'OPPO'; }
        else if (userAgent.includes('vivo')) { brand = 'vivo'; }
        else if (userAgent.includes('OnePlus')) { brand = 'OnePlus'; }
        else if (userAgent.includes('Nothing')) { brand = 'Nothing'; }
        else if (userAgent.includes('Nokia')) { brand = 'Nokia'; }
        else if (userAgent.includes('Moto')) { brand = 'Motorola'; }
        else { brand = 'Android'; }
    }
    else if (/Macintosh|Mac OS X/i.test(userAgent)) {
        brand = 'Apple';
        if (userAgent.includes('Intel Mac OS X')) deviceModel = 'Mac (Intel)';
        else if (userAgent.includes('ARM')) deviceModel = 'Mac (Apple Silicon)';
        else deviceModel = 'Mac';
    }
    else if (/Windows NT/i.test(userAgent)) {
        brand = 'Microsoft';
        const winMatch = userAgent.match(/Windows NT (\d+\.\d+)/);
        if (winMatch) {
            const version = winMatch[1];
            if (version === '10.0') deviceModel = 'Windows 10/11 PC';
            else if (version === '6.3') deviceModel = 'Windows 8.1 PC';
            else if (version === '6.2') deviceModel = 'Windows 8 PC';
            else if (version === '6.1') deviceModel = 'Windows 7 PC';
            else deviceModel = 'Windows PC';
        } else { deviceModel = 'Windows PC'; }
    }
    else if (/Linux/i.test(userAgent) && !/Android/i.test(userAgent)) {
        brand = 'Linux';
        deviceModel = 'Linux Desktop';
    }
    else if (/CrOS/i.test(userAgent)) {
        brand = 'Google';
        deviceModel = 'Chromebook';
    }
    
    return { deviceModel, brand };
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
    // Check for custom user agent from Android app
    return navigator.userAgent.includes('IMMI-Android-App') || 
           navigator.userAgent.includes('IMMI-Presence-360');
}

/**
 * Check and block Android web access if needed
 * Returns true if blocked, false if allowed
 */
async function checkAndBlockAndroidWeb() {
    if (!isAndroidDevice()) return false;
    
    // If from native app, allow
    if (isFromNativeApp()) return false;
    
    // Check with server if web access is blocked
    try {
        const result = await callAPI('checkAndroidVersion', {
            userAgent: navigator.userAgent,
            appVersion: null // No app version for web
        });
        
        if (!result.success && result.code === 'ANDROID_WEB_BLOCKED') {
            showAndroidWebBlockedDialog(result.downloadUrl || APK_DOWNLOAD_URL);
            return true;
        }
    } catch (error) {
        console.error('Check web block error:', error);
        // Default to block if can't verify (security measure)
        showAndroidWebBlockedDialog(APK_DOWNLOAD_URL);
        return true;
    }
    
    return false;
}

/**
 * Check app version and show force update if needed
 * Call this after successful login for Android native app
 */
async function checkAndForceUpdate(currentVersion) {
    if (!isAndroidDevice()) return false;
    if (!isFromNativeApp()) return false;
    
    try {
        const result = await checkForAppUpdate(currentVersion);
        
        if (result.success && result.needsUpdate) {
            showForceUpdateDialog(result.downloadUrl, result.latestVersion, currentVersion);
            return true;
        }
    } catch (error) {
        console.error('Force update check error:', error);
    }
    
    return false;
}

// ============================================
// CANVAS FINGERPRINT
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

// ============================================
// WEBGL FINGERPRINT
// ============================================

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
    
    const fonts = [];
    const testFonts = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia', 'Impact'];
    for (const font of testFonts) {
        if (document.fonts && document.fonts.check(`12px "${font}"`)) {
            fonts.push(font);
        }
    }
    
    const plugins = [];
    for (let i = 0; i < navigator.plugins.length; i++) {
        plugins.push(navigator.plugins[i].name);
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
        fonts: fonts,
        plugins: plugins,
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
// SIMPLE DEVICE FINGERPRINT
// ============================================

function getSimpleDeviceFingerprint() {
    const components = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        screenResolution: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
        deviceMemory: navigator.deviceMemory || 'unknown'
    };
    
    let fingerprintString = '';
    for (let key in components) {
        fingerprintString += components[key] + '|';
    }
    
    let hash = 0;
    for (let i = 0; i < fingerprintString.length; i++) {
        const char = fingerprintString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    
    return {
        hash: Math.abs(hash).toString(16),
        components: components
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
// AUTHENTICATION FUNCTIONS (UPDATED with version)
// ============================================

async function login(email, password) {
    return await callAPI('login', { email: email, password: password });
}

async function userLogin(email, password, appVersion = null) {
    const deviceInfo = await getDeviceInfo();
    
    return await callAPI('userLogin', { 
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
        brand: deviceInfo.brand
    });
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
    const params = { 
        uid: uid, 
        startDate: startDate, 
        endDate: endDate
    };
    
    if (requestingUser && (requestingUser.role === 'admin' || requestingUser.role === 'superadmin')) {
        params.requestingUser = JSON.stringify(requestingUser);
    }
    
    return await callAPI('getAttendance', params);
}

async function getAttendanceWithRemarks(uid, startDate, endDate, requestingUser = null) {
    const params = { 
        uid: uid, 
        startDate: startDate, 
        endDate: endDate
    };
    
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
    return await callAPI('getAllUserLocations', { 
        requestingUser: JSON.stringify(requestingUser) 
    });
}

async function forceLogoutUser(uid, requestingUser) {
    return await callAPI('forceLogoutUser', { 
        uid: uid, 
        requestingUser: JSON.stringify(requestingUser) 
    });
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
    return await callAPI('reactivateUser', { 
        uid: uid, 
        requestingUser: JSON.stringify(requestingUser) 
    });
}

async function autoBlockInactiveUsers() {
    return await callAPI('autoBlockInactiveUsers');
}

// ============================================
// STEP COUNTER FUNCTIONS (Android Only)
// ============================================

async function saveStepCount(uid, stepCount) {
    return await callAPI('saveStepCount', { 
        uid: uid, 
        stepCount: stepCount 
    });
}

async function getLastStepCount(uid) {
    return await callAPI('getLastStepCount', { uid: uid });
}

async function validateStepCount(uid, currentStepCount) {
    return await callAPI('validateStepCount', { 
        uid: uid, 
        currentStepCount: currentStepCount 
    });
}

async function confirmOvertime(uid, status) {
    return await callAPI('confirmOvertime', { 
        uid: uid, 
        status: status 
    });
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
    return await callAPI('reportLocationOff', {
        uid: uid,
        duration: duration
    });
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
    return await callAPI('getTodayAttendanceWithColor', {
        uid: uid,
        date: date
    });
}

// ============================================
// DIARY EXEMPT CHECK
// ============================================

async function isExemptFromAttendance(uid, date) {
    return await callAPI('isExemptFromAttendance', {
        uid: uid,
        date: date
    });
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
// LEAVE REQUEST FUNCTIONS (with 4-hour validation)
// ============================================

async function submitLeaveRequest(uid, userName, type, startDate, endDate, reason, fileUrl) {
    // Frontend validation for out_of_office (max 4 hours)
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
// COURSE DIARY FUNCTIONS (Exempt from attendance)
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
    return await callAPI('recalculateOvertime', { 
        startDate: startDate, 
        endDate: endDate 
    });
}

async function resetTodayAttendance(data) {
    return await callAPI('resetTodayAttendance', { 
        uid: data.uid,
        date: data.date
    });
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
    
    const simpleFingerprint = getSimpleDeviceFingerprint();
    console.log('Simple Fingerprint:', simpleFingerprint);
    
    const deviceInfo = await getDeviceInfo();
    console.log('Device Info:', deviceInfo);
    
    const detailedInfo = await getDetailedDeviceInfo();
    console.log('Detailed Device Info:', detailedInfo);
    
    console.log('================================');
    
    return {
        simple: simpleFingerprint,
        device: deviceInfo,
        detailed: detailedInfo
    };
}

async function debugIPhoneDetection() {
    const userAgent = navigator.userAgent;
    console.log('=== IPHONE DETECTION DEBUG ===');
    console.log('Full UserAgent:', userAgent);
    
    const modelMatch = userAgent.match(/iPhone([0-9]+,[0-9]+)/);
    if (modelMatch) {
        console.log('✅ Found iPhone model identifier:', modelMatch[0]);
        console.log('   Model code:', modelMatch[1]);
        
        const modelMap = {
            '13,4': 'iPhone 12 Pro Max', '13,3': 'iPhone 12 Pro',
            '13,2': 'iPhone 12', '13,1': 'iPhone 12 mini',
            '14,3': 'iPhone 13 Pro Max', '14,2': 'iPhone 13 Pro',
            '14,5': 'iPhone 13', '14,4': 'iPhone 13 mini',
            '15,3': 'iPhone 14 Pro Max', '15,2': 'iPhone 14 Pro',
            '15,4': 'iPhone 14', '15,5': 'iPhone 14 Plus',
            '16,2': 'iPhone 15 Pro Max', '16,1': 'iPhone 15 Pro',
            '16,3': 'iPhone 15', '16,4': 'iPhone 15 Plus',
            '17,2': 'iPhone 16 Pro Max', '17,1': 'iPhone 16 Pro',
            '17,3': 'iPhone 16', '17,4': 'iPhone 16 Plus'
        };
        
        if (modelMap[modelMatch[1]]) {
            console.log('   Maps to:', modelMap[modelMatch[1]]);
        }
    } else {
        console.log('❌ No iPhone model identifier found in UserAgent');
    }
    
    const osMatch = userAgent.match(/OS (\d+)_/);
    if (osMatch) {
        console.log('iOS Version:', osMatch[1]);
    }
    
    const result = detectDeviceModel(userAgent);
    console.log('Detection result:', result);
    console.log('================================');
    
    return { userAgent, modelIdentifier: modelMatch ? modelMatch[0] : null, result };
}

// ============================================
// INITIALIZATION
// ============================================
console.log('✅ api-config.js v5.1 loaded - With Force Update & Web Block');

// Auto-check Android web access when script loads
if (isAndroidDevice() && !isFromNativeApp()) {
    checkAndBlockAndroidWeb();
}

