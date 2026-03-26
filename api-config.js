// Konfigurasi API - TUKAR URL INI selepas deploy
const CONFIG = {
    API_BASE_URL: 'https://script.google.com/macros/s/AKfycbw49o9GuhxeePeifr5vU9_e22BlnGvc6zDgqVLVvMKmSDAHg2Hjlshqu3tou1stvIAlnA/exec'
};

// Fungsi global untuk panggil API
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
// FUNGSI UNTUK KEHADIRAN
// ============================================

async function getAttendance(uid, startDate, endDate, requestingUser) {
    return await callAPI('getAttendance', { 
        uid: uid, 
        startDate: startDate, 
        endDate: endDate,
        requestingUser: requestingUser ? JSON.stringify(requestingUser) : undefined
    });
}

async function clockIn(uid, location, requestingUser) {
    return await callAPI('clockIn', { 
        uid: uid, 
        location: JSON.stringify(location),
        requestingUser: JSON.stringify(requestingUser)
    });
}

async function clockOut(uid, location, requestingUser) {
    return await callAPI('clockOut', { 
        uid: uid, 
        location: JSON.stringify(location),
        requestingUser: JSON.stringify(requestingUser)
    });
}

// ============================================
// FUNGSI UNTUK NOTIFIKASI - DENGAN HISTORY
// ============================================

// Dapatkan semua notifikasi (belum dibaca)
async function getNotifications() {
    return await callAPI('getNotifications');
}

// Dapatkan sejarah notifikasi (telah dibaca)
async function getNotificationHistory() {
    return await callAPI('getNotificationHistory');
}

// Cipta notifikasi baru
async function createNotification(data) {
    return await callAPI('createNotification', { data: JSON.stringify(data) });
}

// Tanda notifikasi sebagai dibaca dan pindah ke history
async function markNotificationRead(id) {
    return await callAPI('markNotificationRead', { data: JSON.stringify({ id: id }) });
}

// Tanda semua notifikasi sebagai dibaca dan pindah ke history
async function markAllNotificationsRead() {
    return await callAPI('markAllNotificationsRead');
}

// Kosongkan sejarah notifikasi
async function clearNotificationHistory() {
    return await callAPI('clearNotificationHistory');
}

// ============================================
// FUNGSI UNTUK LOGIN
// ============================================

async function login(email, password) {
    return await callAPI('login', { email: email, password: password });
}

async function userLogin(email, password) {
    return await callAPI('userLogin', { email: email, password: password });
}

// ============================================
// FUNGSI UTILITY
// ============================================

async function setupSheets() {
    return await callAPI('setupSheets');
}

async function fixInconsistentData() {
    return await callAPI('fixInconsistentData');
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
        getNotifications,
        getNotificationHistory,
        createNotification,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotificationHistory,
        login,
        userLogin,
        setupSheets,
        fixInconsistentData
    };
}
