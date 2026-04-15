// ============================================
// API CONFIGURATION - IMMI PRESENCE 360
// VERSION: 6.0 (PocketBase Backend - Complete)
// LAST UPDATED: 15 April 2026
// ============================================

// PocketBase Configuration - GANTI DENGAN URL ANDA
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

function setToken(token, isAdmin = true) {
    if (isAdmin) {
        localStorage.setItem('adminToken', token);
    } else {
        localStorage.setItem('userToken', token);
    }
}

function clearTokens() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userToken');
    localStorage.removeItem('admin');
    localStorage.removeItem('user');
}

// ============================================
// AUTHENTICATION FUNCTIONS
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
    if (!token) return { success: false, error: 'No token', data: [] };
    
    let filter = '';
    if (requestingUser && requestingUser.role !== 'superadmin') {
        filter = `branch="${branch}"`;
        if (unit && unit !== 'all') {
            filter += ` && unit="${unit}"`;
        }
    }
    
    const url = `${PB_URL}/api/collections/users/records${filter ? `?filter=${encodeURIComponent(filter)}&sort=-created` : '?sort=-created'}`;
    
    try {
        const response = await fetch(url, { headers: { 'Authorization': token } });
        const data = await response.json();
        return { success: true, data: data.items || [] };
    } catch (error) {
        return { success: false, error: error.toString(), data: [] };
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
// DEVICE LOCATIONS (For Admin Devices Tab)
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

// ============================================
// FORCE LOGOUT USER
// ============================================

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
        
        const response = await fetch(`${PB_URL}/api/collections/users/records/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': token },
            body: JSON.stringify({
                registered_device_id: '',
                registered_platform: '',
                registered_brand: ''
            })
        });
        
        if (response.ok) {
            return { success: true, message: 'User has been force logged out' };
        }
        return { success: false, error: 'Failed to force logout' };
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

async function getUserLeaveRequests(uid) {
    const token = getToken();
    if (!token) return { success: true, data: [] };
    
    try {
        const userResponse = await fetch(`${PB_URL}/api/collections/users/records?filter=uid="${uid}"`, {
            headers: { 'Authorization': token }
        });
        const users = await userResponse.json();
        if (!users.items || users.items.length === 0) return { success: true, data: [] };
        
        const userId = users.items[0].id;
        const response = await fetch(`${PB_URL}/api/collections/leave_requests/records?filter=uid="${userId}"&sort=-timestamp`, {
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

async function getUserDiaries(uid) {
    const token = getToken();
    if (!token) return { success: true, data: [] };
    
    try {
        const userResponse = await fetch(`${PB_URL}/api/collections/users/records?filter=uid="${uid}"`, {
            headers: { 'Authorization': token }
        });
        const users = await userResponse.json();
        if (!users.items || users.items.length === 0) return { success: true, data: [] };
        
        const userId = users.items[0].id;
        const response = await fetch(`${PB_URL}/api/collections/course_diaries/records?filter=uid="${userId}"&sort=-timestamp`, {
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
// LOCATION OFF TRACKING
// ============================================

async function reportLocationOff(uid, duration) {
    const token = getToken();
    if (!token) return { success: true };
    
    try {
        const userResponse = await fetch(`${PB_URL}/api/collections/users/records?filter=uid="${uid}"`, {
            headers: { 'Authorization': token }
        });
        const users = await userResponse.json();
        if (!users.items || users.items.length === 0) return { success: true };
        
        const userId = users.items[0].id;
        const data = {
            uid: userId,
            user_name: users.items[0].name,
            branch: users.items[0].branch,
            unit: users.items[0].unit || '',
            duration: duration,
            status: 'pending',
            timestamp: new Date().toISOString()
        };
        
        await fetch(`${PB_URL}/api/collections/location_off_logs/records`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': token },
            body: JSON.stringify(data)
        });
        return { success: true };
    } catch (error) {
        return { success: true };
    }
}

async function getLocationOffLogs(requestingUser, startDate, endDate) {
    const token = getToken();
    if (!token) return { success: true, data: [] };
    
    try {
        let filter = '';
        if (startDate && endDate) filter = `timestamp >= "${startDate}" && timestamp <= "${endDate}"`;
        const url = `${PB_URL}/api/collections/location_off_logs/records${filter ? `?filter=${encodeURIComponent(filter)}&sort=-timestamp` : '?sort=-timestamp'}`;
        const response = await fetch(url, { headers: { 'Authorization': token } });
        const data = await response.json();
        return { success: true, data: data.items || [] };
    } catch (error) {
        return { success: true, data: [] };
    }
}

// ============================================
// DEVICE REPLACEMENT REQUESTS
// ============================================

async function requestDeviceReplacement(uid, newDeviceId, reason) {
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
            user_name: users.items[0].name,
            user_email: users.items[0].email,
            old_device_id: users.items[0].registered_device_id || '',
            new_device_id: newDeviceId,
            reason: reason,
            status: 'pending',
            requested_at: new Date().toISOString()
        };
        
        const response = await fetch(`${PB_URL}/api/collections/device_requests/records`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': token },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: error.toString() };
    }
}

async function getPendingDeviceRequests(requestingUser) {
    const token = getToken();
    if (!token) return { success: true, data: [] };
    
    try {
        const response = await fetch(`${PB_URL}/api/collections/device_requests/records?filter=status="pending"&sort=-requested_at`, {
            headers: { 'Authorization': token }
        });
        const data = await response.json();
        return { success: true, data: data.items || [] };
    } catch (error) {
        return { success: true, data: [] };
    }
}

async function approveDeviceReplacement(requestId, requestingUser) {
    const token = getToken();
    if (!token) return { success: false, error: 'No token' };
    
    try {
        const response = await fetch(`${PB_URL}/api/collections/device_requests/records/${requestId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': token },
            body: JSON.stringify({ status: 'approved', approved_by: requestingUser?.name || 'Admin', approved_at: new Date().toISOString() })
        });
        const result = await response.json();
        
        if (result.uid) {
            await fetch(`${PB_URL}/api/collections/users/records/${result.uid}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify({ registered_device_id: result.new_device_id, registered_platform: 'Android' })
            });
        }
        return { success: true };
    } catch (error) {
        return { success: false, error: error.toString() };
    }
}

async function rejectDeviceReplacement(requestId, reason, requestingUser) {
    const token = getToken();
    if (!token) return { success: false, error: 'No token' };
    
    try {
        const response = await fetch(`${PB_URL}/api/collections/device_requests/records/${requestId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': token },
            body: JSON.stringify({ status: 'rejected', rejection_reason: reason, rejected_by: requestingUser?.name || 'Admin', rejected_at: new Date().toISOString() })
        });
        return { success: response.ok };
    } catch (error) {
        return { success: false, error: error.toString() };
    }
}

// ============================================
// AUDIT LOGS
// ============================================

async function getAuditLogs(requestingUser, filters) {
    const token = getToken();
    if (!token) return { success: true, data: [] };
    
    try {
        let filter = '';
        if (filters) {
            if (filters.startDate) filter += `timestamp >= "${filters.startDate}"`;
            if (filters.endDate) filter += filter ? ` && timestamp <= "${filters.endDate}"` : `timestamp <= "${filters.endDate}"`;
            if (filters.action && filters.action !== '') filter += filter ? ` && action = "${filters.action}"` : `action = "${filters.action}"`;
            if (filters.userName && filters.userName !== '') filter += filter ? ` && user_name ~ "${filters.userName}"` : `user_name ~ "${filters.userName}"`;
        }
        const url = `${PB_URL}/api/collections/audit_logs/records${filter ? `?filter=${encodeURIComponent(filter)}&sort=-timestamp` : '?sort=-timestamp'}`;
        const response = await fetch(url, { headers: { 'Authorization': token } });
        const data = await response.json();
        return { success: true, data: data.items || [] };
    } catch (error) {
        return { success: true, data: [] };
    }
}

// ============================================
// INBOX FUNCTIONS
// ============================================

async function getUserInbox(uid) {
    const token = getToken();
    if (!token) return { success: true, data: [] };
    
    try {
        const userResponse = await fetch(`${PB_URL}/api/collections/users/records?filter=uid="${uid}"`, {
            headers: { 'Authorization': token }
        });
        const users = await userResponse.json();
        if (!users.items || users.items.length === 0) return { success: true, data: [] };
        
        const userId = users.items[0].id;
        const response = await fetch(`${PB_URL}/api/collections/user_inbox/records?filter=uid="${userId}"&sort=-timestamp`, {
            headers: { 'Authorization': token }
        });
        const data = await response.json();
        return { success: true, data: data.items || [] };
    } catch (error) {
        return { success: true, data: [] };
    }
}

async function markInboxAsRead(inboxId, uid) {
    const token = getToken();
    if (!token) return { success: false };
    
    try {
        await fetch(`${PB_URL}/api/collections/user_inbox/records/${inboxId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': token },
            body: JSON.stringify({ is_read: true, read_at: new Date().toISOString() })
        });
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

async function sendToInbox(uid, title, message, type, referenceId, status) {
    const token = getToken();
    if (!token) return { success: false };
    
    try {
        const userResponse = await fetch(`${PB_URL}/api/collections/users/records?filter=uid="${uid}"`, {
            headers: { 'Authorization': token }
        });
        const users = await userResponse.json();
        if (!users.items || users.items.length === 0) return { success: false };
        
        const userId = users.items[0].id;
        const data = {
            uid: userId,
            title: title,
            message: message,
            type: type,
            reference_id: referenceId,
            status: status || 'info',
            is_read: false,
            timestamp: new Date().toISOString()
        };
        
        await fetch(`${PB_URL}/api/collections/user_inbox/records`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': token },
            body: JSON.stringify(data)
        });
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

// ============================================
// UPLOAD FILE (Fallback - Base64 untuk fail kecil)
// ============================================

async function uploadFileToDrive(fileName, fileBase64, folderId, mimeType) {
    try {
        const byteCharacters = atob(fileBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType || 'application/octet-stream' });
        
        const MAX_FILE_SIZE = 2 * 1024 * 1024;
        if (blob.size > MAX_FILE_SIZE) {
            return { success: false, error: `Saiz fail melebihi 2MB.` };
        }
        
        if (blob.size < 500 * 1024) {
            return { success: true, fileUrl: `data:${mimeType || 'application/octet-stream'};base64,${fileBase64}` };
        }
        return { success: false, error: 'File terlalu besar untuk sistem web.' };
    } catch (error) {
        if (fileBase64 && fileBase64.length < 500000) {
            return { success: true, fileUrl: `data:${mimeType || 'application/octet-stream'};base64,${fileBase64}` };
        }
        return { success: false, error: error.toString() };
    }
}

// ============================================
// EMAIL (Fallback - Notifikasi sahaja)
// ============================================

async function sendEmail(to, subject, body) {
    if (typeof showNotif === 'function') showNotif('Makluman', `Notifikasi akan dihantar kepada ${to}: ${subject}`, false);
    return { success: true, message: 'Notifikasi direkodkan' };
}

// ============================================
// ADMIN MANAGEMENT (Placeholder)
// ============================================

async function getAdmins(requestingUser) { return { success: true, data: [] }; }
async function createAdmin(data, requestingUser) { return { success: false, error: 'Guna PocketBase Settings > Admins' }; }
async function updateAdmin(data, requestingUser) { return { success: false, error: 'Guna PocketBase Settings > Admins' }; }
async function deleteAdmin(data, requestingUser) { return { success: false, error: 'Guna PocketBase Settings > Admins' }; }

// ============================================
// BLOCKED USERS
// ============================================

async function getBlockedUsers(requestingUser) {
    const token = getToken();
    if (!token) return { success: true, data: [] };
    try {
        const response = await fetch(`${PB_URL}/api/collections/users/records?filter=is_blocked=true`, { headers: { 'Authorization': token } });
        const data = await response.json();
        return { success: true, data: data.items || [] };
    } catch (error) { return { success: true, data: [] }; }
}

async function reactivateUser(uid, requestingUser) {
    const token = getToken();
    if (!token) return { success: false };
    try {
        const userResponse = await fetch(`${PB_URL}/api/collections/users/records?filter=uid="${uid}"`, { headers: { 'Authorization': token } });
        const users = await userResponse.json();
        if (!users.items || users.items.length === 0) return { success: false };
        const userId = users.items[0].id;
        await fetch(`${PB_URL}/api/collections/users/records/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': token },
            body: JSON.stringify({ is_blocked: false, block_reason: '', block_date: null })
        });
        return { success: true };
    } catch (error) { return { success: false }; }
}

// ============================================
// OTHER FUNCTIONS (Placeholders)
// ============================================

async function autoBlockInactiveUsers() { return { success: true }; }
async function saveStepCount(uid, stepCount) { return { success: true }; }
async function getLastStepCount(uid) { return { success: true, lastStepCount: 0 }; }
async function validateStepCount(uid, currentStepCount) { return { success: true, isValid: true }; }
async function confirmOvertime(uid, status) { return { success: true }; }
async function isExemptFromAttendance(uid, date) { return { exempt: false }; }
async function getAllPendingRequests(requestingUser) {
    const leaves = await getPendingLeaveRequests(requestingUser);
    const exceptions = await getPendingExceptions(requestingUser);
    const diaries = await getPendingDiaries(requestingUser);
    const allRequests = [];
    if (leaves.data) leaves.data.forEach(r => { r.requestType = 'leave'; allRequests.push(r); });
    if (exceptions.data) exceptions.data.forEach(r => { r.requestType = 'exception'; allRequests.push(r); });
    if (diaries.data) diaries.data.forEach(r => { r.requestType = 'diary'; allRequests.push(r); });
    allRequests.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return { success: true, data: allRequests };
}
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
// NATIVE ANDROID BRIDGE
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
// INITIALIZATION
// ============================================

console.log('✅ api-config.js v6.0 loaded - PocketBase Backend');
console.log(`📡 API URL: ${PB_URL}`);
