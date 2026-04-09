const CONFIG = {
    API_BASE_URL: 'https://script.google.com/macros/s/AKfycbwXKIM8LMK9c93r4wFHEA2grIaF7T87FSexUALcH8KgfOD5GRgzxPwt-bTXwYm4vWhvNw/exec'
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Fungsi global untuk panggil API (enhanced)
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
// DEVICE FINGERPRINTING (Untuk Device Binding)
// ============================================

// Get unique device fingerprint
function getDeviceFingerprint() {
    const components = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        screenResolution: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        languages: navigator.languages ? navigator.languages.join(',') : '',
        hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
        deviceMemory: navigator.deviceMemory || 'unknown',
        touchPoints: navigator.maxTouchPoints || 0,
        localStorage: !!window.localStorage,
        sessionStorage: !!window.sessionStorage
    };
    
    // Generate hash from components
    let fingerprintString = '';
    for (let key in components) {
        fingerprintString += components[key] + '|';
    }
    
    // Simple hash function
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

// Get device info for registration
function getDeviceInfo() {
    const fingerprint = getDeviceFingerprint();
    
    // Detect platform
    const userAgent = navigator.userAgent;
    const isAndroid = /android/i.test(userAgent);
    const isIOS = /iphone|ipad|ipod/i.test(userAgent);
    let platform = 'Web';
    let deviceName = 'Desktop Browser';
    
    if (isAndroid) {
        platform = 'Android';
        deviceName = 'Android Device';
    } else if (isIOS) {
        platform = 'iOS';
        deviceName = 'iPhone/iPad';
    }
    
    return {
        deviceId: fingerprint.hash,
        deviceName: deviceName,
        platform: platform,
        userAgent: userAgent,
        screenResolution: fingerprint.components.screenResolution,
        timezone: fingerprint.components.timezone,
        language: fingerprint.components.language,
        hardwareConcurrency: fingerprint.components.hardwareConcurrency,
        deviceMemory: fingerprint.components.deviceMemory
    };
}

// ============================================
// IP LOCATION FUNCTIONS (Untuk Map & Tracking)
// ============================================

// Get client IP and location from ipapi.co
async function getIPLocation() {
    try {
        // Use ipapi.co for IP geolocation (free, no API key needed)
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

// Save current location to server (for admin monitoring)
async function saveMyLocation() {
    try {
        const ipLocation = await getIPLocation();
        if (!ipLocation.success) {
            console.warn('Failed to get IP location:', ipLocation.error);
            return { success: false, error: ipLocation.error };
        }
        
        const deviceInfo = getDeviceInfo();
        
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
        
        // Get current user from localStorage
        const currentUserStr = localStorage.getItem('currentUser');
        if (!currentUserStr) return { success: false, error: 'No user logged in' };
        
        const currentUser = JSON.parse(currentUserStr);
        
        return await callAPI('saveUserIPLocation', {
            uid: currentUser.uid,
            ipData: JSON.stringify(ipData),
            locationData: JSON.stringify(locationData),
            source: deviceInfo.platform === 'Android' ? 'android_web' : (deviceInfo.platform === 'iOS' ? 'ios_web' : 'web')
        });
    } catch (error) {
        console.error('Save location error:', error);
        return { success: false, error: error.toString() };
    }
}

// Start periodic location tracking (every 5 minutes)
let locationTrackingInterval = null;

function startPeriodicLocationTracking() {
    // Stop existing interval if any
    if (locationTrackingInterval) {
        clearInterval(locationTrackingInterval);
    }
    
    // Save location immediately
    saveMyLocation();
    
    // Then save every 5 minutes
    locationTrackingInterval = setInterval(async () => {
        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr) {
            await saveMyLocation();
            console.log('Periodic location saved at', new Date().toLocaleTimeString());
        }
    }, 5 * 60 * 1000); // 5 minutes
}

function stopPeriodicLocationTracking() {
    if (locationTrackingInterval) {
        clearInterval(locationTrackingInterval);
        locationTrackingInterval = null;
    }
}

// ============================================
// BLOCK ANDROID FROM WEB
// ============================================

function isAndroidDevice() {
    return /android/i.test(navigator.userAgent);
}

function isIOSDevice() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function blockAndroidIfNeeded() {
    if (isAndroidDevice()) {
        // Check if this is a webview or native app
        const isNativeApp = navigator.userAgent.includes('IMMI-Android-App');
        
        if (!isNativeApp) {
            // Show blocking message
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
                            <p style="color: #166534; font-size: 12px; margin-top: 4px;">Google Play Store</p>
                        </div>
                        <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">
                            Versi web hanya untuk pengguna iOS.
                        </p>
                        <button onclick="location.reload()" style="margin-top: 24px; background: #1e3a8a; color: white; border: none; padding: 12px 24px; border-radius: 30px; font-weight: 700; cursor: pointer;">
                            Cuba Lagi
                        </button>
                    </div>
                </div>
            `;
            return true; // Blocked
        }
    }
    return false; // Allowed
}

// ============================================
// FUNGSI UNTUK ADMIN DAN SUPERADMIN
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
// FUNGSI UNTUK PENGURUSAN PENGGUNA
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
// FUNGSI UNTUK KEHADIRAN (FIXED - menggunakan callAPI)
// ============================================

async function getAttendance(uid, startDate, endDate, requestingUser) {
    // Jangan hantar requestingUser jika undefined atau null
    const params = { 
        uid: uid, 
        startDate: startDate, 
        endDate: endDate
    };
    
    // Hanya tambah requestingUser jika ada dan diperlukan
    if (requestingUser && requestingUser.uid) {
        params.requestingUser = JSON.stringify(requestingUser);
    }
    
    return await callAPI('getAttendance', params);
}

// FIXED: Gunakan callAPI untuk clockIn
async function clockIn(uid, location, user) {
    return await callAPI('clockIn', {
        uid: uid,
        location: JSON.stringify(location),
        clientIP: getClientIP()
    });
}

// FIXED: Gunakan callAPI untuk clockOut
async function clockOut(uid, location, user) {
    return await callAPI('clockOut', {
        uid: uid,
        location: JSON.stringify(location),
        clientIP: getClientIP()
    });
}

function getClientIP() {
    // This will be handled by Google Apps Script
    return 'web-client';
}

// ============================================
// FUNGSI UNTUK ADMIN MONITORING (IP Location)
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
// FUNGSI UNTUK EMAIL
// ============================================

async function sendEmail(to, subject, body) {
    return await callAPI('sendEmail', { to: to, subject: subject, body: body });
}

// ============================================
// FUNGSI UNTUK LOGIN (Enhanced with Device Info)
// ============================================

async function login(email, password) {
    return await callAPI('login', { email: email, password: password });
}

async function userLogin(email, password) {
    const deviceInfo = getDeviceInfo();
    
    return await callAPI('userLogin', { 
        email: email, 
        password: password,
        userAgent: deviceInfo.userAgent,
        platform: deviceInfo.platform,
        screenResolution: deviceInfo.screenResolution,
        timezone: deviceInfo.timezone,
        language: deviceInfo.language,
        hardwareConcurrency: deviceInfo.hardwareConcurrency,
        deviceMemory: deviceInfo.deviceMemory
    });
}

// ============================================
// FUNGSI APK MANAGEMENT (BARU)
// ============================================

// Save new APK version
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

// Get latest APK version
async function getLatestApkVersion() {
    return await callAPI('getLatestApkVersion');
}

// Get all APK versions history
async function getAllApkVersions() {
    return await callAPI('getAllApkVersions');
}

// Notify all Android users about new APK
async function notifyUsersAboutNewApk(version, releaseNotes, downloadUrl) {
    return await callAPI('notifyUsersAboutNewApk', {
        version: version,
        releaseNotes: releaseNotes,
        downloadUrl: downloadUrl
    });
}

// Get all Android users
async function getAllAndroidUsers() {
    return await callAPI('getAllAndroidUsers');
}

// Send notification to new user
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
// FUNGSI UTILITY
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

// ============================================
// GET IP LOCATION FOR MAP (User Dashboard)
// ============================================

async function getCurrentIPLocation() {
    return await getIPLocation();
}

// ============================================
// EXPORT UNTUK KEGUNAAN GLOBAL
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        callAPI,
        getAdmins,
        createAdmin,
        updateAdmin,
        deleteAdmin,
        getAllUsers,
        getUsers,
        createUser,
        updateUser,
        deleteUser,
        updateUserFace,
        getAttendance,
        clockIn,
        clockOut,
        recalculateOvertime,
        resetTodayAttendance,
        sendEmail,
        login,
        userLogin,
        setupSheets,
        runMigration,
        fixInconsistentData,
        // Device functions
        getDeviceInfo,
        getIPLocation,
        getCurrentIPLocation,
        saveMyLocation,
        startPeriodicLocationTracking,
        stopPeriodicLocationTracking,
        getAllUserLocations,
        forceLogoutUser,
        isAndroidDevice,
        isIOSDevice,
        blockAndroidIfNeeded,
        // APK Management functions (BARU)
        saveApkVersion,
        getLatestApkVersion,
        getAllApkVersions,
        notifyUsersAboutNewApk,
        getAllAndroidUsers,
        sendNewUserNotification
    };
}

