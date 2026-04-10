// ============================================
// API CONFIGURATION - IMMI PRESENCE 360
// VERSION: 3.1 (Enhanced Device Fingerprinting + Full Model Names)
// LAST UPDATED: 10 April 2026
// ============================================

const CONFIG = {
    API_BASE_URL: 'https://script.google.com/macros/s/AKfycbwXKIM8LMK9c93r4wFHEA2grIaF7T87FSexUALcH8KgfOD5GRgzxPwt-bTXwYm4vWhvNw/exec'
};

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
// ENHANCED DEVICE MODEL DETECTION (FULL NAMES)
// ============================================

// Detect device model from userAgent (with full model names)
function detectDeviceModel(userAgent) {
    let deviceModel = 'Unknown';
    let brand = 'Unknown';
    
    // ============================================
    // iOS / iPhone MODEL DETECTION (Full names)
    // ============================================
    if (/iPhone/i.test(userAgent)) {
        brand = 'Apple';
        
        // iPhone model mapping based on identifier
        const modelMatches = {
            // iPhone 16 Series (2024)
            'iPhone17,1': 'iPhone 16 Pro',
            'iPhone17,2': 'iPhone 16 Pro Max',
            'iPhone17,3': 'iPhone 16',
            'iPhone17,4': 'iPhone 16 Plus',
            
            // iPhone 15 Series (2023)
            'iPhone16,1': 'iPhone 15 Pro',
            'iPhone16,2': 'iPhone 15 Pro Max',
            'iPhone16,3': 'iPhone 15',
            'iPhone16,4': 'iPhone 15 Plus',
            
            // iPhone 14 Series (2022)
            'iPhone15,2': 'iPhone 14 Pro',
            'iPhone15,3': 'iPhone 14 Pro Max',
            'iPhone15,4': 'iPhone 14',
            'iPhone15,5': 'iPhone 14 Plus',
            
            // iPhone 13 Series (2021)
            'iPhone14,5': 'iPhone 13',
            'iPhone14,2': 'iPhone 13 Pro',
            'iPhone14,3': 'iPhone 13 Pro Max',
            'iPhone14,4': 'iPhone 13 mini',
            
            // iPhone 12 Series (2020)
            'iPhone13,2': 'iPhone 12',
            'iPhone13,3': 'iPhone 12 Pro',
            'iPhone13,4': 'iPhone 12 Pro Max',
            'iPhone13,1': 'iPhone 12 mini',
            
            // iPhone 11 Series (2019)
            'iPhone12,1': 'iPhone 11',
            'iPhone12,3': 'iPhone 11 Pro',
            'iPhone12,5': 'iPhone 11 Pro Max',
            
            // iPhone XS Series (2018)
            'iPhone11,2': 'iPhone XS',
            'iPhone11,4': 'iPhone XS Max',
            'iPhone11,6': 'iPhone XS Max',
            'iPhone11,8': 'iPhone XR',
            
            // iPhone X (2017)
            'iPhone10,3': 'iPhone X',
            'iPhone10,6': 'iPhone X',
            
            // iPhone 8 Series (2017)
            'iPhone10,1': 'iPhone 8',
            'iPhone10,4': 'iPhone 8',
            'iPhone10,2': 'iPhone 8 Plus',
            'iPhone10,5': 'iPhone 8 Plus',
            
            // iPhone 7 Series (2016)
            'iPhone9,1': 'iPhone 7',
            'iPhone9,3': 'iPhone 7',
            'iPhone9,2': 'iPhone 7 Plus',
            'iPhone9,4': 'iPhone 7 Plus',
            
            // iPhone SE Series
            'iPhone8,4': 'iPhone SE (1st gen)',
            'iPhone14,6': 'iPhone SE (3rd gen)',
            
            // iPhone 6 Series (2014)
            'iPhone7,2': 'iPhone 6',
            'iPhone7,1': 'iPhone 6 Plus',
            
            // iPhone 6S Series (2015)
            'iPhone8,1': 'iPhone 6s',
            'iPhone8,2': 'iPhone 6s Plus',
            
            // Older models
            'iPhone5,1': 'iPhone 5',
            'iPhone5,2': 'iPhone 5',
            'iPhone5,3': 'iPhone 5c',
            'iPhone5,4': 'iPhone 5c',
            'iPhone6,1': 'iPhone 5s',
            'iPhone6,2': 'iPhone 5s',
            'iPhone4,1': 'iPhone 4s',
            'iPhone3,1': 'iPhone 4',
            'iPhone3,2': 'iPhone 4',
            'iPhone3,3': 'iPhone 4',
            'iPhone2,1': 'iPhone 3GS',
            'iPhone1,1': 'iPhone 2G',
            'iPhone1,2': 'iPhone 3G'
        };
        
        // Try to find model by identifier
        for (var identifier in modelMatches) {
            if (userAgent.includes(identifier)) {
                deviceModel = modelMatches[identifier];
                break;
            }
        }
        
        // If still unknown, try to get from OS version
        if (deviceModel === 'Unknown') {
            const osMatch = userAgent.match(/OS (\d+)_/);
            if (osMatch) {
                const osVersion = parseInt(osMatch[1]);
                if (osVersion >= 18) deviceModel = 'iPhone 16 Series';
                else if (osVersion >= 17) deviceModel = 'iPhone 15 Series';
                else if (osVersion >= 16) deviceModel = 'iPhone 14 Series';
                else if (osVersion >= 15) deviceModel = 'iPhone 13 Series';
                else if (osVersion >= 14) deviceModel = 'iPhone 12 Series';
                else if (osVersion >= 13) deviceModel = 'iPhone 11 Series';
                else deviceModel = 'iPhone';
            } else {
                deviceModel = 'iPhone';
            }
        }
    } 
    
    // ============================================
    // IPAD MODEL DETECTION (Full names)
    // ============================================
    else if (/iPad/i.test(userAgent)) {
        brand = 'Apple';
        
        const iPadMatches = {
            'iPad14,1': 'iPad Pro 11" (4th gen)',
            'iPad14,2': 'iPad Pro 12.9" (6th gen)',
            'iPad13,4': 'iPad Pro 11" (3rd gen)',
            'iPad13,5': 'iPad Pro 11" (3rd gen)',
            'iPad13,6': 'iPad Pro 11" (3rd gen)',
            'iPad13,7': 'iPad Pro 11" (3rd gen)',
            'iPad13,8': 'iPad Pro 12.9" (5th gen)',
            'iPad13,9': 'iPad Pro 12.9" (5th gen)',
            'iPad13,10': 'iPad Pro 12.9" (5th gen)',
            'iPad13,11': 'iPad Pro 12.9" (5th gen)',
            'iPad12,1': 'iPad (9th gen)',
            'iPad12,2': 'iPad (9th gen)',
            'iPad11,6': 'iPad (8th gen)',
            'iPad11,7': 'iPad (8th gen)',
            'iPad8,1': 'iPad Pro 11" (1st gen)',
            'iPad8,2': 'iPad Pro 11" (1st gen)',
            'iPad8,3': 'iPad Pro 11" (1st gen)',
            'iPad8,4': 'iPad Pro 11" (1st gen)',
            'iPad8,5': 'iPad Pro 12.9" (3rd gen)',
            'iPad8,6': 'iPad Pro 12.9" (3rd gen)',
            'iPad8,7': 'iPad Pro 12.9" (3rd gen)',
            'iPad8,8': 'iPad Pro 12.9" (3rd gen)'
        };
        
        for (var identifier in iPadMatches) {
            if (userAgent.includes(identifier)) {
                deviceModel = iPadMatches[identifier];
                break;
            }
        }
        
        if (deviceModel === 'Unknown') {
            deviceModel = 'iPad';
        }
    }
    
    // ============================================
    // ANDROID MODEL DETECTION (Full names)
    // ============================================
    else if (/Android/i.test(userAgent)) {
        // Extract device model from userAgent
        const modelMatch = userAgent.match(/; ([\w\s]+?) Build/);
        if (modelMatch && modelMatch[1]) {
            let rawModel = modelMatch[1].trim();
            
            // Clean up model name
            rawModel = rawModel.replace(/ \w+-\w+$/, '');
            rawModel = rawModel.replace(/\(.*?\)/g, '');
            rawModel = rawModel.trim();
            
            deviceModel = rawModel;
        }
        
        // Detect Samsung
        if (userAgent.includes('SM-')) {
            brand = 'Samsung';
            const smMatch = userAgent.match(/SM-[A-Z0-9]+/);
            if (smMatch) {
                const samsungModels = {
                    'SM-S928': 'Galaxy S24 Ultra',
                    'SM-S926': 'Galaxy S24+',
                    'SM-S921': 'Galaxy S24',
                    'SM-S918': 'Galaxy S23 Ultra',
                    'SM-S916': 'Galaxy S23+',
                    'SM-S911': 'Galaxy S23',
                    'SM-S908': 'Galaxy S22 Ultra',
                    'SM-S906': 'Galaxy S22+',
                    'SM-S901': 'Galaxy S22',
                    'SM-N986': 'Galaxy Note 20 Ultra',
                    'SM-N981': 'Galaxy Note 20',
                    'SM-F936': 'Galaxy Z Fold 4',
                    'SM-F946': 'Galaxy Z Fold 5',
                    'SM-F721': 'Galaxy Z Flip 4',
                    'SM-F731': 'Galaxy Z Flip 5',
                    'SM-A736': 'Galaxy A73',
                    'SM-A536': 'Galaxy A53',
                    'SM-A546': 'Galaxy A54',
                    'SM-A336': 'Galaxy A33',
                    'SM-A236': 'Galaxy A23',
                    'SM-A146': 'Galaxy A14',
                    'SM-A056': 'Galaxy A05'
                };
                
                let modelCode = smMatch[0].substring(0, 7);
                if (samsungModels[modelCode]) {
                    deviceModel = samsungModels[modelCode];
                } else {
                    deviceModel = smMatch[0];
                }
            }
        }
        // Detect Google Pixel
        else if (userAgent.includes('Pixel')) {
            brand = 'Google';
            const pixelMatch = userAgent.match(/Pixel (\d+)/);
            if (pixelMatch) {
                const pixelNum = parseInt(pixelMatch[1]);
                if (pixelNum === 8) deviceModel = 'Pixel 8 Pro';
                else if (pixelNum === 7) deviceModel = 'Pixel 7 Pro';
                else if (pixelNum === 6) deviceModel = 'Pixel 6 Pro';
                else deviceModel = `Pixel ${pixelMatch[1]}`;
            }
        }
        // Detect Xiaomi
        else if (userAgent.includes('Redmi')) {
            brand = 'Xiaomi';
            const redmiMatch = userAgent.match(/Redmi (\w+)/);
            if (redmiMatch) {
                deviceModel = `Redmi ${redmiMatch[1]}`;
            }
        }
        else if (userAgent.includes('Mi ')) {
            brand = 'Xiaomi';
            const miMatch = userAgent.match(/Mi (\w+)/);
            if (miMatch) {
                deviceModel = `Xiaomi Mi ${miMatch[1]}`;
            }
        }
        else if (userAgent.includes('POCO')) {
            brand = 'Xiaomi';
            const pocoMatch = userAgent.match(/POCO (\w+)/);
            if (pocoMatch) {
                deviceModel = `POCO ${pocoMatch[1]}`;
            }
        }
        // Detect Realme
        else if (userAgent.includes('RMX')) {
            brand = 'Realme';
            const rmxMatch = userAgent.match(/RMX\w+/);
            if (rmxMatch) {
                deviceModel = rmxMatch[0];
            }
        }
        // Detect Huawei
        else if (userAgent.includes('VOG')) {
            brand = 'Huawei';
            deviceModel = 'P30 Pro';
        }
        else if (userAgent.includes('LYA')) {
            brand = 'Huawei';
            deviceModel = 'Mate 20 Pro';
        }
        else if (userAgent.includes('NOH')) {
            brand = 'Huawei';
            deviceModel = 'Mate 40 Pro';
        }
        // Detect OPPO
        else if (userAgent.includes('OPPO')) {
            brand = 'OPPO';
            const oppoMatch = userAgent.match(/OPPO (\w+)/);
            if (oppoMatch) {
                deviceModel = `OPPO ${oppoMatch[1]}`;
            }
        }
        // Detect vivo
        else if (userAgent.includes('vivo')) {
            brand = 'vivo';
            const vivoMatch = userAgent.match(/vivo (\w+)/);
            if (vivoMatch) {
                deviceModel = `vivo ${vivoMatch[1]}`;
            }
        }
        // Detect OnePlus
        else if (userAgent.includes('OnePlus')) {
            brand = 'OnePlus';
            const oneplusMatch = userAgent.match(/OnePlus (\w+)/);
            if (oneplusMatch) {
                deviceModel = `OnePlus ${oneplusMatch[1]}`;
            }
        }
        // Detect Nothing Phone
        else if (userAgent.includes('Nothing')) {
            brand = 'Nothing';
            deviceModel = 'Nothing Phone';
        }
        // Detect Nokia
        else if (userAgent.includes('Nokia')) {
            brand = 'Nokia';
            const nokiaMatch = userAgent.match(/Nokia (\w+)/);
            if (nokiaMatch) {
                deviceModel = `Nokia ${nokiaMatch[1]}`;
            }
        }
        // Detect Motorola
        else if (userAgent.includes('Moto')) {
            brand = 'Motorola';
            const motoMatch = userAgent.match(/Moto (\w+)/);
            if (motoMatch) {
                deviceModel = `Motorola ${motoMatch[1]}`;
            }
        }
        else {
            brand = 'Android';
        }
    }
    
    // ============================================
    // DESKTOP / LAPTOP DETECTION
    // ============================================
    else if (/Macintosh|Mac OS X/i.test(userAgent)) {
        brand = 'Apple';
        if (userAgent.includes('Mac OS X')) {
            if (userAgent.includes('Intel Mac OS X')) {
                deviceModel = 'Mac (Intel)';
            } else if (userAgent.includes('ARM')) {
                deviceModel = 'Mac (Apple Silicon)';
            } else {
                deviceModel = 'Mac';
            }
        }
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
        } else {
            deviceModel = 'Windows PC';
        }
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
// DETAILED DEVICE INFO (Async)
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
    
    console.log('Detected Device:', { deviceModel, brand });
    
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
    if (modelSuffix && modelSuffix !== 'Unknown') {
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
    
    if (/android/i.test(userAgent)) {
        platform = 'Android';
        deviceName = deviceModel || 'Android Device';
    } else if (/iphone|ipad|ipod/i.test(userAgent)) {
        platform = 'iOS';
        deviceName = deviceModel || 'iPhone/iPad';
    } else if (/windows|mac|linux/i.test(userAgent) && !/mobile/i.test(userAgent)) {
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
// SIMPLE DEVICE FINGERPRINT (Sync)
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
    return navigator.userAgent.includes('IMMI-Android-App');
}

function blockAndroidIfNeeded() {
    if (isAndroidDevice() && !isFromNativeApp()) {
        document.body.innerHTML = `
            <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 20px; font-family: 'Inter', sans-serif;">
                <div style="background: white; border-radius: 32px; padding: 40px; max-width: 400px; text-align: center;">
                    <div style="width: 80px; height: 80px; background: #fee2e2; border-radius: 40px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                        <span style="font-size: 48px;">📱</span>
                    </div>
                    <h2 style="margin: 20px 0 10px; font-size: 24px; font-weight: 800;">Akses Tidak Dibenarkan</h2>
                    <p style="color: #64748b; margin-bottom: 24px; line-height: 1.5;">
                        Sila gunakan <strong>Aplikasi Android IMMI Presence 360</strong> untuk akses sistem.
                    </p>
                    <div style="background: #f0fdf4; padding: 16px; border-radius: 20px; margin: 20px 0;">
                        <p style="color: #166534; font-size: 14px; font-weight: 600;">📱 Muat Turun Aplikasi</p>
                        <p style="color: #166534; font-size: 12px; margin-top: 4px;">Google Play Store / GitHub</p>
                    </div>
                    <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">
                        Versi web hanya untuk pengguna iOS dan Desktop.
                    </p>
                    <button onclick="location.reload()" style="margin-top: 24px; background: #1e3a8a; color: white; border: none; padding: 12px 24px; border-radius: 30px; font-weight: 700; cursor: pointer;">
                        Cuba Lagi
                    </button>
                </div>
            </div>
        `;
        return true;
    }
    return false;
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
// AUTHENTICATION FUNCTIONS
// ============================================

async function login(email, password) {
    return await callAPI('login', { email: email, password: password });
}

async function userLogin(email, password) {
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
// APK MANAGEMENT FUNCTIONS
// ============================================

async function saveApkVersion(version, fileId, downloadUrl, fileSize, releaseNotes, uploadedBy) {
    return await callAPI('saveApkVersion', {
        version: version,
        fileId: fileId,
        downloadUrl: downloadUrl,
        fileSize: fileSize,
        releaseNotes: releaseNotes,
        uploadedBy: uploadedBy
    });
}

async function getLatestApkVersion() {
    return await callAPI('getLatestApkVersion');
}

async function getAllApkVersions() {
    return await callAPI('getAllApkVersions');
}

async function notifyUsersAboutNewApk(version, releaseNotes, downloadUrl) {
    return await callAPI('notifyUsersAboutNewApk', {
        version: version,
        releaseNotes: releaseNotes,
        downloadUrl: downloadUrl
    });
}

async function getAllAndroidUsers() {
    return await callAPI('getAllAndroidUsers');
}

async function sendNewUserNotification(userEmail, userName, branch, unit, password, userPlatform) {
    return await callAPI('sendNewUserNotification', {
        userEmail: userEmail,
        userName: userName,
        branch: branch,
        unit: unit,
        password: password,
        userPlatform: userPlatform
    });
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
// DEBUG FUNCTION
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

// ============================================
// INITIALIZATION
// ============================================
console.log('✅ api-config.js v3.1 loaded with enhanced device fingerprinting and full model names');

