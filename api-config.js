// ============================================
// API CONFIGURATION - IMMI PRESENCE 360
// VERSION: 6.0 (PocketBase Backend)
// LAST UPDATED: 15 April 2026
// ============================================

// PocketBase Configuration - GANTI DENGAN URL TUNNEL ANDA
const PB_URL = 'https://amanda-fonts-venice-result.trycloudflare.com';

// APK Configuration
const APK_DOWNLOAD_URL = 'https://github.com/jimswk/IMMI-Presence-360/releases/latest/download/app-release.apk';
const MIN_REQUIRED_ANDROID_VERSION = '1.0.8';
const MAX_OUT_OF_OFFICE_HOURS = 4;
const DRIVE_FOLDER_ID = '1MIGgknZhgw594XgeSetALOpdiMW5VVak';

// ============================================
// CORE API FUNCTIONS
// ============================================

// Get token from localStorage
function getToken() {
    return localStorage.getItem('adminToken') || localStorage.getItem('userToken');
}

// Generic fetch function
async function pbFetch(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = token;
    }
    
    const response = await fetch(`${PB_URL}${endpoint}`, {
        ...options,
        headers
    });
    
    return await response.json();
}

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

// Admin Login
async function login(email, password) {
    try {
        const response = await fetch(`${PB_URL}/api/admins/auth-with-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identity: email, password: password })
        });
        
        const data = await response.json();
        
        if (data.token) {
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('admin', JSON.stringify(data.admin));
            return { success: true, user: data.admin, token: data.token };
        }
        return { success: false, error: data.message };
    } catch (error) {
        return { success: false, error: error.toString() };
    }
}

// User Login
async function userLogin(email, password) {
    try {
        const response = await fetch(`${PB_URL}/api/collections/users/auth-with-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identity: email, password: password })
        });
        
        const data = await response.json();
        
        if (data.token) {
            localStorage.setItem('userToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.record));
            return { success: true, user: data.record, token: data.token };
        }
        return { success: false, error: data.message };
    } catch (error) {
        return { success: false, error: error.toString() };
    }
}

// ============================================
// USER MANAGEMENT
// ============================================

async function getUsers(branch, unit, requestingUser) {
    const token = getToken();
    let filter = '';
    
    if (requestingUser && requestingUser.role !== 'superadmin') {
        filter = `branch="${branch}"`;
        if (unit && unit !== 'all') {
            filter += ` && unit="${unit}"`;
        }
    }
    
    const url = `${PB_URL}/api/collections/users/records${filter ? `?filter=${encodeURIComponent(filter)}` : ''}`;
    const response = await fetch(url, {
        headers: { 'Authorization': token }
    });
    
    const data = await response.json();
    return { success: true, data: data.items || [] };
}

async function getAllUsers(requestingUser) {
    return getUsers(null, null, requestingUser);
}

async function createUser(data, requestingUser) {
    const token = getToken();
    
    const userData = {
        email: data.email,
        password: data.password,
        passwordConfirm: data.password,
        name: data.name,
        uid: data.uid,
        branch: data.branch,
        unit: data.unit || '',
        location: data.location || '',
        lat: parseFloat(data.lat) || 0,
        lng: parseFloat(data.lng) || 0,
        radius: parseInt(data.radius) || 500,
        phone: data.phone || '',
        face_descriptor: data.faceDescriptor || '',
        created_by: data.createdBy || ''
    };
    
    const response = await fetch(`${PB_URL}/api/collections/users/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify(userData)
    });
    
    return await response.json();
}

async function updateUser(data, requestingUser) {
    const token = getToken();
    
    // Get user by uid
    const getResponse = await fetch(`${PB_URL}/api/collections/users/records?filter=uid="${data.uid}"`, {
        headers: { 'Authorization': token }
    });
    const users = await getResponse.json();
    
    if (!users.items || users.items.length === 0) {
        return { success: false, error: 'User not found' };
    }
    
    const userId = users.items[0].id;
    
    const updateData = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.unit) updateData.unit = data.unit;
    if (data.location) updateData.location = data.location;
    if (data.lat) updateData.lat = parseFloat(data.lat);
    if (data.lng) updateData.lng = parseFloat(data.lng);
    if (data.radius) updateData.radius = parseInt(data.radius);
    if (data.phone) updateData.phone = data.phone;
    if (data.password && data.password !== '') {
        updateData.password = data.password;
        updateData.passwordConfirm = data.password;
    }
    
    const response = await fetch(`${PB_URL}/api/collections/users/records/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify(updateData)
    });
    
    return await response.json();
}

async function deleteUser(data, requestingUser) {
    const token = getToken();
    
    const getResponse = await fetch(`${PB_URL}/api/collections/users/records?filter=uid="${data.uid}"`, {
        headers: { 'Authorization': token }
    });
    const users = await getResponse.json();
    
    if (!users.items || users.items.length === 0) {
        return { success: false, error: 'User not found' };
    }
    
    const userId = users.items[0].id;
    
    const response = await fetch(`${PB_URL}/api/collections/users/records/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
    });
    
    return { success: response.status === 204 };
}

async function updateUserFace(uid, faceDescriptor) {
    const token = getToken();
    
    const getResponse = await fetch(`${PB_URL}/api/collections/users/records?filter=uid="${uid}"`, {
        headers: { 'Authorization': token }
    });
    const users = await getResponse.json();
    
    if (!users.items || users.items.length === 0) {
        return { success: false, error: 'User not found' };
    }
    
    const userId = users.items[0].id;
    
    const response = await fetch(`${PB_URL}/api/collections/users/records/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ face_descriptor: faceDescriptor })
    });
    
    return await response.json();
}

// ============================================
// ATTENDANCE FUNCTIONS
// ============================================

async function getAttendance(uid, startDate, endDate, requestingUser = null) {
    const token = getToken();
    
    // Get user by uid
    const userResponse = await fetch(`${PB_URL}/api/collections/users/records?filter=uid="${uid}"`, {
        headers: { 'Authorization': token }
    });
    const users = await userResponse.json();
    
    if (!users.items || users.items.length === 0) {
        return { success: true, data: [] };
    }
    
    const userId = users.items[0].id;
    
    const filter = `uid="${userId}" && date >= "${startDate}" && date <= "${endDate}"`;
    const response = await fetch(`${PB_URL}/api/collections/attendance/records?filter=${encodeURIComponent(filter)}&sort=-date`, {
        headers: { 'Authorization': token }
    });
    
    const data = await response.json();
    return { success: true, data: data.items || [] };
}

async function getAttendanceWithRemarks(uid, startDate, endDate, requestingUser = null) {
    // For now, same as getAttendance
    return getAttendance(uid, startDate, endDate, requestingUser);
}

async function clockIn(uid, location, user) {
    const token = getToken();
    
    // Get user by uid
    const userResponse = await fetch(`${PB_URL}/api/collections/users/records?filter=uid="${uid}"`, {
        headers: { 'Authorization': token }
    });
    const users = await userResponse.json();
    
    if (!users.items || users.items.length === 0) {
        return { success: false, error: 'User not found' };
    }
    
    const userId = users.items[0].id;
    const today = new Date().toISOString().slice(0, 10);
    
    const data = {
        uid: userId,
        date: today,
        clock_in: new Date().toISOString(),
        clock_in_location: typeof location === 'string' ? location : JSON.stringify(location),
        status: 'clocked_in'
    };
    
    const response = await fetch(`${PB_URL}/api/collections/attendance/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify(data)
    });
    
    return await response.json();
}

async function clockOut(uid, location, user) {
    const token = getToken();
    
    // Get user by uid
    const userResponse = await fetch(`${PB_URL}/api/collections/users/records?filter=uid="${uid}"`, {
        headers: { 'Authorization': token }
    });
    const users = await userResponse.json();
    
    if (!users.items || users.items.length === 0) {
        return { success: false, error: 'User not found' };
    }
    
    const userId = users.items[0].id;
    const today = new Date().toISOString().slice(0, 10);
    
    // Find today's attendance record
    const getResponse = await fetch(`${PB_URL}/api/collections/attendance/records?filter=uid="${userId}" && date="${today}"`, {
        headers: { 'Authorization': token }
    });
    const records = await getResponse.json();
    
    if (!records.items || records.items.length === 0) {
        return { success: false, error: 'No clock in record found' };
    }
    
    const recordId = records.items[0].id;
    const clockInTime = new Date(records.items[0].clock_in);
    const clockOutTime = new Date();
    const totalHours = (clockOutTime - clockInTime) / (1000 * 60 * 60);
    const overtime = Math.max(0, totalHours - 9);
    
    const data = {
        clock_out: clockOutTime.toISOString(),
        clock_out_location: typeof location === 'string' ? location : JSON.stringify(location),
        total_hours: totalHours.toFixed(2),
        overtime: overtime.toFixed(2),
        status: 'clocked_out'
    };
    
    const response = await fetch(`${PB_URL}/api/collections/attendance/records/${recordId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify(data)
    });
    
    const result = await response.json();
    return { success: true, totalHours: totalHours.toFixed(2), overtime: overtime.toFixed(2), ...result };
}

// ============================================
// LEAVE REQUESTS
// ============================================

async function submitLeaveRequest(uid, userName, type, startDate, endDate, reason, fileUrl) {
    const token = getToken();
    
    const userResponse = await fetch(`${PB_URL}/api/collections/users/records?filter=uid="${uid}"`, {
        headers: { 'Authorization': token }
    });
    const users = await userResponse.json();
    
    if (!users.items || users.items.length === 0) {
        return { success: false, error: 'User not found' };
    }
    
    const userId = users.items[0].id;
    
    const data = {
        uid: userId,
        user_name: userName,
        type: type,
        start_date: startDate,
        end_date: endDate,
        reason: reason,
        file_url: fileUrl || '',
        status: 'pending',
        timestamp: new Date().toISOString()
    };
    
    const response = await fetch(`${PB_URL}/api/collections/leave_requests/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify(data)
    });
    
    return await response.json();
}

async function getPendingLeaveRequests(requestingUser) {
    const token = getToken();
    const response = await fetch(`${PB_URL}/api/collections/leave_requests/records?filter=status="pending"&sort=-timestamp`, {
        headers: { 'Authorization': token }
    });
    const data = await response.json();
    return { success: true, data: data.items || [] };
}

async function getUserLeaveRequests(uid) {
    const token = getToken();
    
    const userResponse = await fetch(`${PB_URL}/api/collections/users/records?filter=uid="${uid}"`, {
        headers: { 'Authorization': token }
    });
    const users = await userResponse.json();
    
    if (!users.items || users.items.length === 0) {
        return { success: true, data: [] };
    }
    
    const userId = users.items[0].id;
    
    const response = await fetch(`${PB_URL}/api/collections/leave_requests/records?filter=uid="${userId}"&sort=-timestamp`, {
        headers: { 'Authorization': token }
    });
    const data = await response.json();
    return { success: true, data: data.items || [] };
}

async function updateLeaveRequestStatus(requestId, status, adminResponse) {
    const token = getToken();
    const response = await fetch(`${PB_URL}/api/collections/leave_requests/records/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ 
            status: status, 
            admin_response: adminResponse, 
            responded_at: new Date().toISOString() 
        })
    });
    return await response.json();
}

// ============================================
// COURSE DIARIES
// ============================================

async function submitCourseDiary(uid, userName, date, type, title, description, fileUrl) {
    const token = getToken();
    
    const userResponse = await fetch(`${PB_URL}/api/collections/users/records?filter=uid="${uid}"`, {
        headers: { 'Authorization': token }
    });
    const users = await userResponse.json();
    
    if (!users.items || users.items.length === 0) {
        return { success: false, error: 'User not found' };
    }
    
    const userId = users.items[0].id;
    
    const data = {
        uid: userId,
        user_name: userName,
        date: date,
        type: type,
        title: title,
        description: description,
        file_url: fileUrl || '',
        status: 'pending',
        timestamp: new Date().toISOString()
    };
    
    const response = await fetch(`${PB_URL}/api/collections/course_diaries/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify(data)
    });
    
    return await response.json();
}

async function getPendingDiaries(requestingUser) {
    const token = getToken();
    const response = await fetch(`${PB_URL}/api/collections/course_diaries/records?filter=status="pending"&sort=-timestamp`, {
        headers: { 'Authorization': token }
    });
    const data = await response.json();
    return { success: true, data: data.items || [] };
}

async function getUserDiaries(uid) {
    const token = getToken();
    
    const userResponse = await fetch(`${PB_URL}/api/collections/users/records?filter=uid="${uid}"`, {
        headers: { 'Authorization': token }
    });
    const users = await userResponse.json();
    
    if (!users.items || users.items.length === 0) {
        return { success: true, data: [] };
    }
    
    const userId = users.items[0].id;
    
    const response = await fetch(`${PB_URL}/api/collections/course_diaries/records?filter=uid="${userId}"&sort=-timestamp`, {
        headers: { 'Authorization': token }
    });
    const data = await response.json();
    return { success: true, data: data.items || [] };
}

async function updateDiaryStatus(diaryId, status, adminNotes) {
    const token = getToken();
    const response = await fetch(`${PB_URL}/api/collections/course_diaries/records/${diaryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ 
            status: status, 
            admin_notes: adminNotes, 
            reviewed_at: new Date().toISOString() 
        })
    });
    return await response.json();
}

// ============================================
// EXCEPTION REPORTS
// ============================================

async function submitException(uid, userName, date, reason, fileUrl) {
    const token = getToken();
    
    const userResponse = await fetch(`${PB_URL}/api/collections/users/records?filter=uid="${uid}"`, {
        headers: { 'Authorization': token }
    });
    const users = await userResponse.json();
    
    if (!users.items || users.items.length === 0) {
        return { success: false, error: 'User not found' };
    }
    
    const userId = users.items[0].id;
    
    const data = {
        uid: userId,
        user_name: userName,
        date: date,
        reason: reason,
        file_url: fileUrl || '',
        status: 'pending',
        timestamp: new Date().toISOString()
    };
    
    const response = await fetch(`${PB_URL}/api/collections/attendance_exceptions/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify(data)
    });
    
    return await response.json();
}

async function getPendingExceptions(requestingUser) {
    const token = getToken();
    const response = await fetch(`${PB_URL}/api/collections/attendance_exceptions/records?filter=status="pending"&sort=-timestamp`, {
        headers: { 'Authorization': token }
    });
    const data = await response.json();
    return { success: true, data: data.items || [] };
}

async function updateExceptionStatus(exceptionId, status, adminResponse) {
    const token = getToken();
    const response = await fetch(`${PB_URL}/api/collections/attendance_exceptions/records/${exceptionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ 
            status: status, 
            admin_response: adminResponse, 
            responded_at: new Date().toISOString() 
        })
    });
    return await response.json();
}

// ============================================
// TODAY ATTENDANCE WITH COLOR
// ============================================

async function getTodayAttendanceWithColor(uid, date) {
    const token = getToken();
    
    const userResponse = await fetch(`${PB_URL}/api/collections/users/records?filter=uid="${uid}"`, {
        headers: { 'Authorization': token }
    });
    const users = await userResponse.json();
    
    if (!users.items || users.items.length === 0) {
        return { color: 'red', status: 'USER NOT FOUND', totalHours: 0 };
    }
    
    const userId = users.items[0].id;
    const targetDate = date || new Date().toISOString().slice(0, 10);
    
    const response = await fetch(`${PB_URL}/api/collections/attendance/records?filter=uid="${userId}" && date="${targetDate}"`, {
        headers: { 'Authorization': token }
    });
    const records = await response.json();
    
    if (!records.items || records.items.length === 0) {
        return { color: 'red', status: 'TIADA CLOCK IN', totalHours: 0 };
    }
    
    const record = records.items[0];
    const hasClockIn = !!record.clock_in;
    const hasClockOut = !!record.clock_out;
    const totalHours = record.total_hours || 0;
    
    if (!hasClockIn) {
        return { color: 'red', status: 'TIADA CLOCK IN', totalHours: 0 };
    }
    
    if (hasClockIn && !hasClockOut) {
        return { color: 'yellow', status: 'DALAM BERTUGAS', totalHours: 0 };
    }
    
    if (hasClockIn && hasClockOut && totalHours < 9) {
        const shortfall = (9 - totalHours).toFixed(1);
        return { color: 'orange', status: `SELESAI (KURANG ${shortfall} JAM)`, totalHours: totalHours };
    }
    
    return { color: 'green', status: 'SELESAI (CUKUP)', totalHours: totalHours };
}

// ============================================
// OTHER FUNCTIONS (Placeholders)
// ============================================

async function getAllUserLocations(requestingUser) {
    return { success: true, data: [] };
}

async function forceLogoutUser(uid, requestingUser) {
    return { success: true, message: 'Force logout not implemented in PocketBase version' };
}

async function sendEmail(to, subject, body) {
    return { success: false, error: 'Email not implemented in PocketBase version' };
}

async function getAdmins(requestingUser) {
    return { success: true, data: [] };
}

async function createAdmin(data, requestingUser) {
    return { success: false, error: 'Not implemented' };
}

async function updateAdmin(data, requestingUser) {
    return { success: false, error: 'Not implemented' };
}

async function deleteAdmin(data, requestingUser) {
    return { success: false, error: 'Not implemented' };
}

async function getBlockedUsers(requestingUser) {
    return { success: true, data: [] };
}

async function reactivateUser(uid, requestingUser) {
    return { success: false, error: 'Not implemented' };
}

async function autoBlockInactiveUsers() {
    return { success: true, message: 'Not implemented' };
}

async function saveStepCount(uid, stepCount) {
    return { success: true };
}

async function getLastStepCount(uid) {
    return { success: true, lastStepCount: 0 };
}

async function validateStepCount(uid, currentStepCount) {
    return { success: true, isValid: true };
}

async function confirmOvertime(uid, status) {
    return { success: true };
}

async function requestDeviceReplacement(uid, newDeviceId, reason) {
    return { success: false, error: 'Not implemented' };
}

async function getPendingDeviceRequests(requestingUser) {
    return { success: true, data: [] };
}

async function approveDeviceReplacement(requestId, requestingUser) {
    return { success: false, error: 'Not implemented' };
}

async function rejectDeviceReplacement(requestId, reason, requestingUser) {
    return { success: false, error: 'Not implemented' };
}

async function reportLocationOff(uid, duration) {
    return { success: true };
}

async function getLocationOffLogs(requestingUser, startDate, endDate) {
    return { success: true, data: [] };
}

async function isExemptFromAttendance(uid, date) {
    return { exempt: false };
}

async function getUserInbox(uid) {
    return { success: true, data: [] };
}

async function markInboxAsRead(inboxId, uid) {
    return { success: true };
}

async function sendToInbox(uid, title, message, type, referenceId, status) {
    return { success: true };
}

async function getAllPendingRequests(requestingUser) {
    return { success: true, data: [] };
}

async function uploadFileToDrive(fileName, fileBase64, folderId, mimeType) {
    return { success: false, error: 'Not implemented' };
}

async function setupSheets() {
    return { success: true };
}

async function runMigration() {
    return { success: true };
}

async function fixInconsistentData() {
    return { success: true };
}

async function recalculateOvertime(startDate, endDate) {
    return { success: true, recalculated: 0 };
}

async function resetTodayAttendance(data) {
    return { success: false, error: 'Not implemented' };
}

async function reportCrash(crashData) {
    return { success: true };
}

async function getActiveEmergency(uid) {
    return { success: true, hasActive: false };
}

async function updateEmergencyStatus(uid, reportId, status) {
    return { success: true };
}

async function getNearbyCrashes(latitude, longitude, radius, hours) {
    return { success: true, data: [] };
}

async function confirmRescue(rescueData) {
    return { success: true };
}

async function getAllCrashReports(requestingUser) {
    return { success: true, data: [] };
}

async function addEmergencyContact(data, requestingUser) {
    return { success: false, error: 'Not implemented' };
}

async function getEmergencyContacts(uid, requestingUser) {
    return { success: true, data: [] };
}

async function deleteEmergencyContact(uid, contactEmail, requestingUser) {
    return { success: false, error: 'Not implemented' };
}

async function getAuditLogs(requestingUser, filters) {
    return { success: true, data: [] };
}

async function debugDeviceInfo() {
    return { device: {}, detailed: {} };
}

// ============================================
// NATIVE ANDROID BRIDGE (Simplified)
// ============================================

function getNativeAppVersion() {
    if (typeof Android !== 'undefined' && Android && Android.getAppVersion) {
        try {
            return Android.getAppVersion();
        } catch(e) {
            return null;
        }
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

async function checkForAppUpdate(currentVersion) {
    return { success: true, needsUpdate: false };
}

async function getApkDownloadInfo() {
    return { success: true, downloadUrl: APK_DOWNLOAD_URL, version: MIN_REQUIRED_ANDROID_VERSION };
}

function isAndroidDevice() {
    return /android/i.test(navigator.userAgent);
}

function isIOSDevice() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isFromNativeApp() {
    return navigator.userAgent.includes('IMMI-Android-App') || 
           navigator.userAgent.includes('IMMI-Presence-360') ||
           typeof Android !== 'undefined';
}

function showAlert(title, message, icon, callback) {
    alert(`${title}: ${message}`);
    if (callback) callback();
}

// ============================================
// DEVICE INFO (Simplified)
// ============================================

async function getDeviceInfo() {
    return {
        deviceId: 'web_' + Date.now(),
        deviceName: 'Web Browser',
        platform: 'Web',
        userAgent: navigator.userAgent
    };
}

// ============================================
// INITIALIZATION
// ============================================

console.log('✅ api-config.js v6.0 loaded - PocketBase Backend');
console.log(`📡 API URL: ${PB_URL}`);
