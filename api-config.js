// Konfigurasi API - TUKAR URL INI
const CONFIG = {
    API_BASE_URL: 'https://script.google.com/macros/s/AKfycbxQZmYE49CDoxfZEbG6l1CoW0CV83i_maFqEFsvHwV3thh36G-rrumK3_a5U7nQrAgHUA/exec'
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
