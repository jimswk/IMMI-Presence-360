// ============================================
// API CONFIGURATION - IMMI PRESENCE 360
// VERSION: 6.0 (PocketBase Backend with callAPI)
// LAST UPDATED: 15 April 2026
// ============================================

// PocketBase Configuration
const PB_URL = 'http://100.107.138.113:8080';

// APK Configuration
const APK_DOWNLOAD_URL = 'https://github.com/jimswk/IMMI-Presence-360/releases/latest/download/app-release.apk';
const MIN_REQUIRED_ANDROID_VERSION = '1.0.8';
const MAX_OUT_OF_OFFICE_HOURS = 4;

// ============================================
// TOKEN MANAGEMENT
// ============================================

function getToken() {
    return localStorage.getItem('adminToken') || localStorage.getItem('userToken');
}

function clearTokens() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userToken');
    localStorage.removeItem('admin');
    localStorage.removeItem('user');
}

// ============================================
// AUTHENTICATION
// ============================================

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
    if (!token) return { success: true, data: [] };
    
    let filter = '';
    if (requestingUser && requestingUser.role !== 'superadmin') {
        filter = `branch="${branch}"`;
        if (unit && unit !== 'all') filter += ` && unit="${unit}"`;
    }
    
    const url = `${PB_URL}/api/collections/users/records${filter ? `?filter=${encodeURIComponent(filter)}&sort=-created` : '?sort=-created'}`;
    
    try {
        const response = await fetch(url, { headers: { 'Authorization': token } });
        const data = await response.json();
        return { success: true, data: data.items || [] };
    } catch (error) {
        return { success: true, data: [] };
    }
}

async function getAllUsers(requestingUser) {
    return getUsers(null, null, requestingUser);
}

async function createUser(data, requestingUser) {
    const token = getToken();
    if (!token) return { success: false, error: 'No token' };
    
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
    
    try {
        const response = await fetch(`${PB_URL}/api/collections/users/records`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': token },
            body: JSON.stringify(userData)
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.toString() };
    }
}

async function updateUser(data, requestingUser) {
    const token = getToken();
    if (!token) return { success: false, error: 'No token' };
    
    try {
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
    } catch (error) {
        return { success: false, error: error.toString() };
    }
}

async function deleteUser(data, requestingUser) {
    const token = getToken();
    if (!token) return { success: false, error: 'No token' };
    
    try {
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
    } catch (error) {
        return { success: false, error: error.toString() };
    }
}

async function updateUserFace(uid, faceDescriptor) {
    const token = getToken();
    if (!token) return { success: false, error: 'No token' };
    
    try {
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
    } catch (error) {
        return { success: false, error: error.toString() };
    }
}

// ============================================
// ATTENDANCE FUNCTIONS
// ============================================

async function getAttendance(uid, startDate, endDate, requestingUser = null) {
    const token = getToken();
    if (!token) return { success: true, data: [] };
    
    try {
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
    } catch (error) {
        return { success: true, data: [] };
    }
}

async function getAttendanceWithRemarks(uid, startDate, endDate, requestingUser = null) {
    return getAttendance(uid, startDate, endDate, requestingUser);
}

async function clockIn(uid, location, user) {
    const token = getToken();
    if (!token) return { success: false, error: 'No token' };
    
    try {
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
    } catch (error) {
        return { success: false, error: error.toString() };
    }
}

async function clockOut(uid, location, user) {
    const token = getToken();
    if (!token) return { success: false, error: 'No token' };
    
    try {
        const userResponse = await fetch(`${PB_URL}/api/collections/users/records?filter=uid="${uid}"`, {
            headers: { 'Authorization': token }
        });
        const users = await userResponse.json();
        
        if (!users.items || users.items.length === 0) {
            return { success: false, error: 'User not found' };
        }
        
        const userId = users.items[0].id;
        const today = new Date().toISOString().slice(0, 10);
        
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
    } catch (error) {
        return { success: false, error: error.toString() };
    }
}

// ============================================
// DEVICE LOCATIONS
// ============================================

async function getAllUserLocations(requestingUser) {
    const token = getToken();
    if (!token) return { success: true, data: [] };
    
    try {
        const usersResponse = await fetch(`${PB_URL}/api/collections/users/records`, {
            headers: { 'Authorization': token }
        });
        const usersData = await usersResponse.json();
        const users = usersData.items || [];
        
        const locations = [];
        for (const user of users) {
            locations.push({
                uid: user.uid,
                name: user.name,
                email: user.email,
                branch: user.branch,
                unit: user.unit || '-',
                ip: '-',
                city: '-',
                region: '-',
                country: '-',
                lat: user.lat || 0,
                lng: user.lng || 0,
                lastSeen: user.updated || user.created,
                source: user.registered_platform || 'Web',
                trustScore: user.registered_platform === 'Android' ? 100 : (user.registered_platform === 'iOS' ? 70 : 50),
                deviceModel: user.registered_device_id ? 'Registered' : '-',
                brand: user.registered_brand || '-',
                lastActive: user.updated || user.created
            });
        }
        return { success: true, data: locations };
    } catch (error) {
        return { success: true, data: [] };
    }
}

async function forceLogoutUser(uid, requestingUser) {
    const token = getToken();
    if (!token) return { success: false, error: 'No token' };
    
    try {
        const userResponse = await fetch(`${PB_URL}/api/collections/users/records?filter=uid="${uid}"`, {
            headers: { 'Authorization': token }
        });
        const users = await userResponse.json();
        
        if (!users.items || users.items.length === 0) {
            return { success: false, error: 'User not found' };
        }
        
        const userId = users.items[0].id;
        await fetch(`${PB_URL}/api/collections/users/records/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': token },
            body: JSON.stringify({ registered_device_id: '', registered_platform: '', registered_brand: '' })
        });
        return { success: true, message: 'User has been force logged out' };
    } catch (error) {
        return { success: false, error: error.toString() };
    }
}

// ============================================
// TODAY ATTENDANCE WITH COLOR
// ============================================

async function getTodayAttendanceWithColor(uid, date) {
    const token = getToken();
    if (!token) return { color: 'red', status: 'No token', totalHours: 0 };
    
    try {
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
        
        if (!hasClockIn) return { color: 'red', status: 'TIADA CLOCK IN', totalHours: 0 };
        if (hasClockIn && !hasClockOut) return { color: 'yellow', status: 'DALAM BERTUGAS', totalHours: 0 };
        if (hasClockIn && hasClockOut && totalHours < 9) {
            const shortfall = (9 - totalHours).toFixed(1);
            return { color: 'orange', status: `SELESAI (KURANG ${shortfall} JAM)`, totalHours: totalHours };
        }
        return { color: 'green', status: 'SELESAI (CUKUP)', totalHours: totalHours };
    } catch (error) {
        return { color: 'red', status: 'ERROR', totalHours: 0 };
    }
}

// ============================================
// LEAVE REQUESTS
// ============================================

async function submitLeaveRequest(uid, userName, type, startDate, endDate, reason, fileUrl) {
    const token = getToken();
    if (!token) return { success: false, error: 'No token' };
    
    if (type === 'out_of_office') {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const hoursRequested = (end - start) / (1000 * 60 * 60);
        if (hoursRequested > MAX_OUT_OF_OFFICE_HOURS) {
            return { success: false, error: `Kebenaran keluar pejabat maksimum ${MAX_OUT_OF_OFFICE_HOURS} jam sahaja.` };
        }
    }
    
    try {
        const userResponse = await fetch(`${PB_URL}/api/collections/users/records?filter=uid="${uid}"`, {
            headers: { 'Authorization': token }
        });
        const users = await userResponse.json();
        if (!users.items || users.items.length === 0) return { success: false, error: 'User not found' };
        
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
    } catch (error) {
        return { success: false, error: error.toString() };
    }
}

async function getPendingLeaveRequests(requestingUser) {
    const token = getToken();
    if (!token) return { success: true, data: [] };
    
    try {
        const response = await fetch(`${PB_URL}/api/collections/leave_requests/records?filter=status="pending"&sort=-timestamp`, {
            headers: { 'Authorization': token }
        });
        const data = await response.json();
        return { success: true, data: data.items || [] };
    } catch (error) {
        return { success: true, data: [] };
    }
}

async function updateLeaveRequestStatus(requestId, status, adminResponse) {
    const token = getToken();
    if (!token) return { success: false, error: 'No token' };
    
    try {
        const response = await fetch(`${PB_URL}/api/collections/leave_requests/records/${requestId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': token },
            body: JSON.stringify({ status: status, admin_response: adminResponse, responded_at: new Date().toISOString() })
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.toString() };
    }
}

// ============================================
// COURSE DIARIES
// ============================================

async function submitCourseDiary(uid, userName, date, type, title, description, fileUrl) {
    const token = getToken();
    if (!token) return { success: false, error: 'No token' };
    
    try {
        const userResponse = await fetch(`${PB_URL}/api/collections/users/records?filter=uid="${uid}"`, {
            headers: { 'Authorization': token }
        });
        const users = await userResponse.json();
        if (!users.items || users.items.length === 0) return { success: false, error: 'User not found' };
        
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
    } catch (error) {
        return { success: false, error: error.toString() };
    }
}

async function getPendingDiaries(requestingUser) {
    const token = getToken();
    if (!token) return { success: true, data: [] };
    
    try {
        const response = await fetch(`${PB_URL}/api/collections/course_diaries/records?filter=status="pending"&sort=-timestamp`, {
            headers: { 'Authorization': token }
        });
        const data = await response.json();
        return { success: true, data: data.items || [] };
    } catch (error) {
        return { success: true, data: [] };
    }
}

async function updateDiaryStatus(diaryId, status, adminNotes) {
    const token = getToken();
    if (!token) return { success: false, error: 'No token' };
    
    try {
        const response = await fetch(`${PB_URL}/api/collections/course_diaries/records/${diaryId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': token },
            body: JSON.stringify({ status: status, admin_notes: adminNotes, reviewed_at: new Date().toISOString() })
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.toString() };
    }
}

// ============================================
// EXCEPTION REPORTS
// ============================================

async function submitException(uid, userName, date, reason, fileUrl) {
    const token = getToken();
    if (!token) return { success: false, error: 'No token' };
    
    try {
        const userResponse = await fetch(`${PB_URL}/api/collections/users/records?filter=uid="${uid}"`, {
            headers: { 'Authorization': token }
        });
        const users = await userResponse.json();
        if (!users.items || users.items.length === 0) return { success: false, error: 'User not found' };
        
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
    } catch (error) {
        return { success: false, error: error.toString() };
    }
}

async function getPendingExceptions(requestingUser) {
    const token = getToken();
    if (!token) return { success: true, data: [] };
    
    try {
        const response = await fetch(`${PB_URL}/api/collections/attendance_exceptions/records?filter=status="pending"&sort=-timestamp`, {
            headers: { 'Authorization': token }
        });
        const data = await response.json();
        return { success: true, data: data.items || [] };
    } catch (error) {
        return { success: true, data: [] };
    }
}

async function updateExceptionStatus(exceptionId, status, adminResponse) {
    const token = getToken();
    if (!token) return { success: false, error: 'No token' };
    
    try {
        const response = await fetch(`${PB_URL}/api/collections/attendance_exceptions/records/${exceptionId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': token },
            body: JSON.stringify({ status: status, admin_response: adminResponse, responded_at: new Date().toISOString() })
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.toString() };
    }
}

// ============================================
// LOCATION OFF
// ============================================

async function reportLocationOff(uid, duration) {
    return { success: true };
}

async function getLocationOffLogs(requestingUser, startDate, endDate) {
    return { success: true, data: [] };
}

// ============================================
// DEVICE REQUESTS
// ============================================

async function getPendingDeviceRequests(requestingUser) {
    return { success: true, data: [] };
}

async function approveDeviceReplacement(requestId, requestingUser) {
    return { success: true };
}

async function rejectDeviceReplacement(requestId, reason, requestingUser) {
    return { success: true };
}

// ============================================
// AUDIT LOGS
// ============================================

async function getAuditLogs(requestingUser, filters) {
    return { success: true, data: [] };
}

// ============================================
// INBOX
// ============================================

async function getUserInbox(uid) {
    return { success: true, data: [] };
}

async function markInboxAsRead(inboxId, uid) {
    return { success: true };
}

async function sendToInbox(uid, title, message, type, referenceId, status) {
    return { success: true };
}

// ============================================
// UPLOAD & EMAIL (Fallback)
// ============================================

async function uploadFileToDrive(fileName, fileBase64, folderId, mimeType) {
    if (fileBase64 && fileBase64.length < 500000) {
        return { success: true, fileUrl: `data:${mimeType || 'application/octet-stream'};base64,${fileBase64}` };
    }
    return { success: false, error: 'File too large' };
}

async function sendEmail(to, subject, body) {
    if (typeof showNotif === 'function') showNotif('Makluman', `Notifikasi: ${subject}`, false);
    return { success: true };
}

// ============================================
// ADMIN MANAGEMENT (Placeholder)
// ============================================

async function getAdmins(requestingUser) { return { success: true, data: [] }; }
async function createAdmin(data, requestingUser) { return { success: false, error: 'Guna PocketBase Settings' }; }
async function updateAdmin(data, requestingUser) { return { success: false, error: 'Guna PocketBase Settings' }; }
async function deleteAdmin(data, requestingUser) { return { success: false, error: 'Guna PocketBase Settings' }; }
async function getBlockedUsers(requestingUser) { return { success: true, data: [] }; }
async function reactivateUser(uid, requestingUser) { return { success: true }; }
async function autoBlockInactiveUsers() { return { success: true }; }
async function saveStepCount(uid, stepCount) { return { success: true }; }
async function getLastStepCount(uid) { return { success: true, lastStepCount: 0 }; }
async function validateStepCount(uid, currentStepCount) { return { success: true, isValid: true }; }
async function confirmOvertime(uid, status) { return { success: true }; }
async function isExemptFromAttendance(uid, date) { return { exempt: false }; }
async function getAllPendingRequests(requestingUser) { return { success: true, data: [] }; }
async function setupSheets() { return { success: true }; }
async function runMigration() { return { success: true }; }
async function fixInconsistentData() { return { success: true }; }
async function recalculateOvertime(startDate, endDate) { return { success: true, recalculated: 0 }; }
async function resetTodayAttendance(data) { return { success: false }; }
async function reportCrash(crashData) { return { success: true }; }
async function getActiveEmergency(uid) { return { success: true, hasActive: false }; }
async function updateEmergencyStatus(uid, reportId, status) { return { success: true }; }
async function getNearbyCrashes(latitude, longitude, radius, hours) { return { success: true, data: [] }; }
async function confirmRescue(rescueData) { return { success: true }; }
async function getAllCrashReports(requestingUser) { return { success: true, data: [] }; }
async function addEmergencyContact(data, requestingUser) { return { success: false }; }
async function getEmergencyContacts(uid, requestingUser) { return { success: true, data: [] }; }
async function deleteEmergencyContact(uid, contactEmail, requestingUser) { return { success: false }; }
async function debugDeviceInfo() { return { device: {}, detailed: {} }; }
async function getClientIP() {
    try { const response = await fetch('https://api.ipify.org?format=json'); const data = await response.json(); return data.ip; }
    catch (error) { return 'unknown'; }
}
async function getDeviceInfo() { return { deviceId: 'web_' + Date.now(), deviceName: 'Web Browser', platform: 'Web', userAgent: navigator.userAgent }; }

// ============================================
// NATIVE BRIDGE
// ============================================

function getNativeAppVersion() {
    if (typeof Android !== 'undefined' && Android && Android.getAppVersion) {
        try { return Android.getAppVersion(); } catch(e) { return null; }
    }
    return null;
}
function openDownloadUrl(url) {
    if (typeof Android !== 'undefined' && Android && Android.openDownloadUrl) Android.openDownloadUrl(url);
    else window.open(url, '_blank');
}
function closeApp() {
    if (typeof Android !== 'undefined' && Android && Android.closeApp) Android.closeApp();
    else alert('Sila tutup aplikasi dan buka semula selepas update.');
}
async function checkForAppUpdate(currentVersion) { return { success: true, needsUpdate: false }; }
async function getApkDownloadInfo() { return { success: true, downloadUrl: APK_DOWNLOAD_URL, version: MIN_REQUIRED_ANDROID_VERSION }; }
function isAndroidDevice() { return /android/i.test(navigator.userAgent); }
function isIOSDevice() { return /iphone|ipad|ipod/i.test(navigator.userAgent); }
function isFromNativeApp() { return navigator.userAgent.includes('IMMI-Android-App') || navigator.userAgent.includes('IMMI-Presence-360') || typeof Android !== 'undefined'; }
function showAlert(title, message, icon, callback) { alert(`${title}: ${message}`); if (callback) callback(); }

// ============================================
// LEGACY callAPI FUNCTION (Compatibility)
// ============================================

async function callAPI(method, params = {}) {
    console.log(`callAPI: ${method}`);
    
    try {
        switch(method) {
            case 'login':
                return await login(params.email, params.password);
            case 'userLogin':
                return await userLogin(params.email, params.password);
            case 'getUsers':
                return await getUsers(params.branch, params.unit, params.requestingUser ? JSON.parse(params.requestingUser) : null);
            case 'createUser':
                return await createUser(JSON.parse(params.data), params.requestingUser ? JSON.parse(params.requestingUser) : null);
            case 'updateUser':
                return await updateUser(JSON.parse(params.data), params.requestingUser ? JSON.parse(params.requestingUser) : null);
            case 'deleteUser':
                return await deleteUser(JSON.parse(params.data), params.requestingUser ? JSON.parse(params.requestingUser) : null);
            case 'updateUserFace':
                return await updateUserFace(params.uid, params.faceDescriptor);
            case 'getAttendance':
                return await getAttendance(params.uid, params.startDate, params.endDate, params.requestingUser ? JSON.parse(params.requestingUser) : null);
            case 'getAttendanceWithRemarks':
                return await getAttendanceWithRemarks(params.uid, params.startDate, params.endDate, params.requestingUser ? JSON.parse(params.requestingUser) : null);
            case 'clockIn':
                return await clockIn(params.uid, JSON.parse(params.location), null);
            case 'clockOut':
                return await clockOut(params.uid, JSON.parse(params.location), null);
            case 'getAllUserLocations':
                return await getAllUserLocations(params.requestingUser ? JSON.parse(params.requestingUser) : null);
            case 'forceLogoutUser':
                return await forceLogoutUser(params.uid, params.requestingUser ? JSON.parse(params.requestingUser) : null);
            case 'getTodayAttendanceWithColor':
                return await getTodayAttendanceWithColor(params.uid, params.date);
            case 'getPendingExceptions':
                return await getPendingExceptions(params.requestingUser ? JSON.parse(params.requestingUser) : null);
            case 'getPendingLeaveRequests':
                return await getPendingLeaveRequests(params.requestingUser ? JSON.parse(params.requestingUser) : null);
            case 'getPendingDiaries':
                return await getPendingDiaries(params.requestingUser ? JSON.parse(params.requestingUser) : null);
            case 'updateExceptionStatus':
                return await updateExceptionStatus(params.exceptionId, params.status, params.adminResponse);
            case 'updateLeaveRequestStatus':
                return await updateLeaveRequestStatus(params.requestId, params.status, params.adminResponse);
            case 'updateDiaryStatus':
                return await updateDiaryStatus(params.diaryId, params.status, params.adminNotes);
            case 'getAuditLogs':
                return await getAuditLogs(params.requestingUser ? JSON.parse(params.requestingUser) : null, params.filters ? JSON.parse(params.filters) : null);
            case 'getLocationOffLogs':
                return await getLocationOffLogs(params.requestingUser ? JSON.parse(params.requestingUser) : null, params.startDate, params.endDate);
            case 'getPendingDeviceRequests':
                return await getPendingDeviceRequests(params.requestingUser ? JSON.parse(params.requestingUser) : null);
            case 'approveDeviceReplacement':
                return await approveDeviceReplacement(params.requestId, params.requestingUser ? JSON.parse(params.requestingUser) : null);
            case 'rejectDeviceReplacement':
                return await rejectDeviceReplacement(params.requestId, params.reason, params.requestingUser ? JSON.parse(params.requestingUser) : null);
            case 'submitLeaveRequest':
                return await submitLeaveRequest(params.uid, params.userName, params.type, params.startDate, params.endDate, params.reason, params.fileUrl);
            case 'submitException':
                return await submitException(params.uid, params.userName, params.date, params.reason, params.fileUrl);
            case 'submitCourseDiary':
                return await submitCourseDiary(params.uid, params.userName, params.date, params.type, params.title, params.description, params.fileUrl);
            case 'sendEmail':
                return await sendEmail(params.to, params.subject, params.body);
            case 'getAdmins':
                return await getAdmins(params.requestingUser ? JSON.parse(params.requestingUser) : null);
            case 'getAllUsers':
                return await getAllUsers(params.requestingUser ? JSON.parse(params.requestingUser) : null);
            case 'getBlockedUsers':
                return await getBlockedUsers(params.requestingUser ? JSON.parse(params.requestingUser) : null);
            case 'reactivateUser':
                return await reactivateUser(params.uid, params.requestingUser ? JSON.parse(params.requestingUser) : null);
            case 'recalculateOvertime':
                return await recalculateOvertime(params.startDate, params.endDate);
            case 'getUserInbox':
                return await getUserInbox(params.uid);
            case 'markInboxAsRead':
                return await markInboxAsRead(params.inboxId, params.uid);
            case 'sendToInbox':
                return await sendToInbox(params.uid, params.title, params.message, params.type, params.referenceId, params.status);
            case 'uploadFileToDrive':
                return await uploadFileToDrive(params.fileName, params.fileBase64, params.folderId, params.mimeType);
            case 'checkForAppUpdate':
                return await checkForAppUpdate(params.currentVersion);
            case 'getApkDownloadInfo':
                return await getApkDownloadInfo();
            default:
                return { success: false, error: `Method ${method} not implemented` };
        }
    } catch (error) {
        return { success: false, error: error.toString() };
    }
}

// ============================================
// INITIALIZATION
// ============================================

console.log('✅ api-config.js v6.0 loaded - PocketBase Backend with callAPI');
console.log(`📡 API URL: ${PB_URL}`);
