// ============================================
// API CONFIGURATION - IMMI PRESENCE 360
// VERSION: 3.0 (Enhanced Device Fingerprinting)
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
// ENHANCED DEVICE FINGERPRINTING
// ============================================

// Get canvas fingerprint (unique per device/browser)
function getCanvasFingerprint() {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 50;
        
        // Draw complex pattern for uniqueness
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
        
        // Draw circle
        ctx.beginPath();
        ctx.arc(50, 35, 10, 0, 2 * Math.PI);
        ctx.fillStyle = '#ff0';
        ctx.fill();
        
        return canvas.toDataURL();
    } catch(e) {
        return 'canvas_not_supported';
    }
}

// Get WebGL fingerprint (unique per GPU)
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

// Detect device model from userAgent
function detectDeviceModel(userAgent) {
    let deviceModel = 'Unknown';
    let brand = 'Unknown';
    
    // iOS model detection
    if (/iPhone/i.test(userAgent)) {
        brand = 'Apple';
        // iPhone model mapping based on identifier
        if (userAgent.includes('iPhone14,2')) deviceModel = 'iPhone 12 Pro';
        else if (userAgent.includes('iPhone14,3')) deviceModel = 'iPhone 12 Pro Max';
        else if (userAgent.includes('iPhone14,4')) deviceModel = 'iPhone 12 mini';
        else if (userAgent.includes('iPhone14,5')) deviceModel = 'iPhone 13';
        else if (userAgent.includes('iPhone14,6')) deviceModel = 'iPhone SE (3rd gen)';
        else if (userAgent.includes('iPhone14,7')) deviceModel = 'iPhone 13 Pro';
        else if (userAgent.includes('iPhone14,8')) deviceModel = 'iPhone 13 Pro Max';
        else if (userAgent.includes('iPhone15,2')) deviceModel = 'iPhone 14 Pro';
        else if (userAgent.includes('iPhone15,3')) deviceModel = 'iPhone 14 Pro Max';
        else if (userAgent.includes('iPhone15,4')) deviceModel = 'iPhone 14';
        else if (userAgent.includes('iPhone15,5')) deviceModel = 'iPhone 14 Plus';
        else if (userAgent.includes('iPhone16,1')) deviceModel = 'iPhone 15 Pro';
        else if (userAgent.includes('iPhone16,2')) deviceModel = 'iPhone 15 Pro Max';
        else if (userAgent.includes('iPhone16,3')) deviceModel = 'iPhone 15';
        else if (userAgent.includes('iPhone16,4')) deviceModel = 'iPhone 15 Plus';
        else if (userAgent.includes('iPhone17,1')) deviceModel = 'iPhone 16 Pro';
        else if (userAgent.includes('iPhone17,2')) deviceModel = 'iPhone 16 Pro Max';
        else if (userAgent.includes('iPhone17,3')) deviceModel = 'iPhone 16';
        else if (userAgent.includes('iPhone17,4')) deviceModel = 'iPhone 16 Plus';
        else deviceModel = 'iPhone';
    } 
    // Android model detection
    else if (/Android/i.test(userAgent)) {
        // Extract device model from userAgent
        const modelMatch = userAgent.match(/; ([\w\s]+?) Build/);
        if (modelMatch && modelMatch[1]) {
            deviceModel = modelMatch[1].trim();
        }
        
        // Detect brand
        if (userAgent.includes('SM-')) {
            brand = 'Samsung';
            const smMatch = userAgent.match(/SM-[A-Z0-9]+/);
            if (smMatch) deviceModel = smMatch[0];
        }
        else if (userAgent.includes('Redmi')) brand = 'Xiaomi';
        else if (userAgent.includes('RMX')) brand = 'Realme';
        else if (userAgent.includes('VOG')) brand = 'Huawei';
        else if (userAgent.includes('Pixel')) brand = 'Google';
        else if (userAgent.includes('OPPO')) brand = 'OPPO';
        else if (userAgent.includes('vivo')) brand = 'vivo';
        else if (userAgent.includes('Mi ')) brand = 'Xiaomi';
        else brand = 'Android';
    }
    
    return { deviceModel, brand };
}

// Get detailed device info (async - includes battery)
async function getDetailedDeviceInfo() {
    const userAgent = navigator.userAgent;
    const { deviceModel, brand } = detectDeviceModel(userAgent);
    
    // Get screen details
    const screenDetails = {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth,
        pixelRatio: window.devicePixelRatio || 1,
        orientation: screen.orientation ? screen.orientation.type : 'unknown'
    };
    
    // Get battery info (if available)
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
    
    // Get installed fonts (simple check)
    const fonts = [];
    const testFonts = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia', 'Impact'];
    for (const font of testFonts) {
        if (document.fonts && document.fonts.check(`12px "${font}"`)) {
            fonts.push(font);
        }
    }
    
    // Get plugins list
    const plugins = [];
    for (let i = 0; i < navigator.plugins.length; i++) {
        plugins.push(navigator.plugins[i].name);
    }
    
    // Get canvas fingerprint
    const canvasFingerprint = getCanvasFingerprint();
    
    // Get WebGL fingerprint
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

// Generate STRONG device ID (combines multiple factors)
async function generateStrongDeviceId() {
    const deviceInfo = await getDetailedDeviceInfo();
    
    // Combine multiple unique factors
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
    
    // Generate hash using SHA-256 style (simplified)
    let hash = 0;
    for (let i = 0; i < fingerprintParts.length; i++) {
        const char = fingerprintParts.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    
    // Create primary device ID (hex)
    const primaryId = Math.abs(hash).toString(16);
    
    // Add device model as suffix for easy identification
    const modelSuffix = deviceInfo.deviceModel.replace(/[^a-zA-Z0-9]/g, '').substring(0, 15);
    const brandPrefix = deviceInfo.brand.substring(0, 5);
    
    // Final device ID format: [hash]_[brand]_[model]
    let deviceId = primaryId;
    if (brandPrefix !== 'Unknown') {
        deviceId = `${primaryId}_${brandPrefix}`;
    }
    if (modelSuffix) {
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

// Get device info for registration (MAIN FUNCTION)
async function getDeviceInfo() {
    const strongId = await generateStrongDeviceId();
    const userAgent = navigator.userAgent;
    
    // Detect platform
    let platform = 'Web';
    let deviceName = strongId.deviceModel || 'Desktop Browser';
    
    if (/android/i.test(userAgent)) {
        platform = 'Android';
        deviceName = strongId.deviceModel || 'Android Device';
    } else if (/iphone|ipad|ipod/i.test(userAgent)) {
        platform = 'iOS';
        deviceName = strongId.deviceModel || 'iPhone/iPad';
    } else if (/windows|mac|linux/i.test(userAgent) && !/mobile/i.test(userAgent)) {
        platform = 'Desktop';
        deviceName = strongId.deviceModel || (navigator.platform.includes('Mac') ? 'Mac' : 'Windows PC');
    }
    
    return {
        deviceId: strongId.deviceId,
        deviceName: deviceName,
        deviceModel: strongId.deviceModel,
        brand: strongId.brand,
        platform: platform,
        userAgent: userAgent,
        screenResolution: strongId.screenResolution,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
        deviceMemory: navigator.deviceMemory || 'unknown'
    };
}

// Get simple device fingerprint (synchronous, for quick checks)
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

// Block Android from web access
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
// EXPORTS (for module usage)
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        callAPI,
        // Device functions
        getDeviceInfo,
        getSimpleDeviceFingerprint,
        getDetailedDeviceInfo,
        generateStrongDeviceId,
        isAndroidDevice,
        isIOSDevice,
        isDesktopDevice,
        isFromNativeApp,
        blockAndroidIfNeeded,
        // Location functions
        getIPLocation,
        saveMyLocation,
        startPeriodicLocationTracking,
        stopPeriodicLocationTracking,
        getCurrentIPLocation,
        // Auth functions
        login,
        userLogin,
        // Admin functions
        getAdmins,
        createAdmin,
        updateAdmin,
        deleteAdmin,
        // User functions
        getAllUsers,
        getUsers,
        createUser,
        updateUser,
        deleteUser,
        updateUserFace,
        // Attendance functions
        getAttendance,
        clockIn,
        clockOut,
        // Monitoring functions
        getAllUserLocations,
        forceLogoutUser,
        // Email functions
        sendEmail,
        // APK functions
        saveApkVersion,
        getLatestApkVersion,
        getAllApkVersions,
        notifyUsersAboutNewApk,
        getAllAndroidUsers,
        sendNewUserNotification,
        // Blocked users functions
        getBlockedUsers,
        reactivateUser,
        autoBlockInactiveUsers,
        // Step counter functions
        saveStepCount,
        getLastStepCount,
        validateStepCount,
        confirmOvertime,
        // Utility functions
        setupSheets,
        runMigration,
        fixInconsistentData,
        recalculateOvertime,
        resetTodayAttendance,
        // Debug
        debugDeviceInfo
    };
}

// ============================================
// INITIALIZATION
// ============================================
console.log('✅ api-config.js v3.0 loaded with enhanced device fingerprinting');

