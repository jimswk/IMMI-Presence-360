// Konfigurasi API - TUKAR URL INI selepas deploy
const CONFIG = {
    API_BASE_URL: 'https://script.google.com/macros/s/AKfycbxfRngTA7Xhl4DKnKPUchC84be46eRC8GccHGDvdSK76GV8QlR3Y-PuuVPJ89v1GAMw5g/exec'
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
    
    // Add cache buster
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
// FUNGSI KHUSUS UNTUK ADMIN DAN SUPERADMIN
// ============================================

// Fungsi untuk mendapatkan senarai admin (dengan requestingUser untuk kawalan akses)
async function getAdmins(requestingUser) {
    return await callAPI('getAdmins', { requestingUser: JSON.stringify(requestingUser) });
}

// Fungsi untuk mencipta admin baru (hanya superadmin)
async function createAdmin(data, requestingUser) {
    return await callAPI('createAdmin', { 
        data: JSON.stringify(data),
        requestingUser: JSON.stringify(requestingUser)
    });
}

// Fungsi untuk mengemaskini admin (hanya superadmin boleh tukar cawangan)
async function updateAdmin(data, requestingUser) {
    return await callAPI('updateAdmin', { 
        data: JSON.stringify(data),
        requestingUser: JSON.stringify(requestingUser)
    });
}

// Fungsi untuk memadam admin (hanya superadmin)
async function deleteAdmin(data, requestingUser) {
    return await callAPI('deleteAdmin', { 
        data: JSON.stringify(data),
        requestingUser: JSON.stringify(requestingUser)
    });
}

// ============================================
// FUNGSI KHUSUS UNTUK PENGURUSAN PENGGUNA
// ============================================

// Fungsi untuk mendapatkan semua pengguna (dengan kawalan cawangan)
async function getAllUsers(requestingUser) {
    return await callAPI('getAllUsers', { requestingUser: JSON.stringify(requestingUser) });
}

// Fungsi untuk mendapatkan pengguna mengikut cawangan dan unit
async function getUsers(branch, unit, requestingUser) {
    return await callAPI('getUsers', { 
        branch: branch, 
        unit: unit,
        requestingUser: JSON.stringify(requestingUser)
    });
}

// Fungsi untuk mencipta pengguna baru
async function createUser(data, requestingUser) {
    return await callAPI('createUser', { 
        data: JSON.stringify(data),
        requestingUser: JSON.stringify(requestingUser)
    });
}

// Fungsi untuk mengemaskini pengguna
async function updateUser(data, requestingUser) {
    return await callAPI('updateUser', { 
        data: JSON.stringify(data),
        requestingUser: JSON.stringify(requestingUser)
    });
}

// Fungsi untuk memadam pengguna
async function deleteUser(data, requestingUser) {
    return await callAPI('deleteUser', { 
        data: JSON.stringify(data),
        requestingUser: JSON.stringify(requestingUser)
    });
}

// Fungsi untuk mengemaskini wajah pengguna sahaja
async function updateUserFace(uid, faceDescriptor) {
    return await callAPI('updateUserFace', { uid: uid, faceDescriptor: faceDescriptor });
}

// ============================================
// FUNGSI UNTUK KEHADIRAN
// ============================================

// Fungsi untuk mendapatkan rekod kehadiran
async function getAttendance(uid, startDate, endDate, requestingUser) {
    return await callAPI('getAttendance', { 
        uid: uid, 
        startDate: startDate, 
        endDate: endDate,
        requestingUser: requestingUser ? JSON.stringify(requestingUser) : undefined
    });
}

// Fungsi untuk clock in
async function clockIn(uid, location, requestingUser) {
    return await callAPI('clockIn', { 
        uid: uid, 
        location: JSON.stringify(location),
        requestingUser: JSON.stringify(requestingUser)
    });
}

// Fungsi untuk clock out
async function clockOut(uid, location, requestingUser) {
    return await callAPI('clockOut', { 
        uid: uid, 
        location: JSON.stringify(location),
        requestingUser: JSON.stringify(requestingUser)
    });
}

// ============================================
// FUNGSI UNTUK NOTIFIKASI
// ============================================

// Fungsi untuk mendapatkan semua notifikasi
async function getNotifications() {
    return await callAPI('getNotifications');
}

// Fungsi untuk mencipta notifikasi baru
async function createNotification(data) {
    return await callAPI('createNotification', { data: JSON.stringify(data) });
}

// Fungsi untuk menandakan notifikasi sebagai dibaca
async function markNotificationRead(id) {
    return await callAPI('markNotificationRead', { data: JSON.stringify({ id: id }) });
}

// Fungsi untuk menandakan semua notifikasi sebagai dibaca
async function markAllNotificationsRead() {
    return await callAPI('markAllNotificationsRead');
}

// Fungsi untuk memadam notifikasi (hard delete)
async function deleteNotification(id) {
    return await callAPI('deleteNotification', { data: JSON.stringify({ id: id }) });
}

// Fungsi untuk memadam semua notifikasi yang telah dibaca
async function deleteAllReadNotifications() {
    return await callAPI('deleteAllReadNotifications');
}

// ============================================
// FUNGSI UNTUK LOGIN
// ============================================

// Fungsi login untuk admin dan superadmin
async function login(email, password) {
    return await callAPI('login', { email: email, password: password });
}

// Fungsi login untuk pengguna biasa
async function userLogin(email, password) {
    return await callAPI('userLogin', { email: email, password: password });
}

// ============================================
// FUNGSI UTILITY
// ============================================

// Fungsi untuk setup sheets (hanya untuk admin)
async function setupSheets() {
    return await callAPI('setupSheets');
}

// Fungsi untuk membetulkan data yang tidak konsisten
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
        createNotification,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        deleteAllReadNotifications,
        login,
        userLogin,
        setupSheets,
        fixInconsistentData
    };
}
