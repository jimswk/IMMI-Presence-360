// Konfigurasi API - TUKAR URL INI
const CONFIG = {
    API_BASE_URL: 'https://script.google.com/macros/s/AKfycbxBUNJugOlHN4yxpDWY9e8YUq7JHvDRD0XOrrktZBDfRhY80OwzHcsLbtcPyLNfq0CBMQ/exec'
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

// Dalam api-config.js, tambah timeout
async function callAPI(method, params = {}, retryCount = 3) {
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
    
    for (let attempt = 1; attempt <= retryCount; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
            
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            const text = await response.text();
            
            if (!text || text.trim() === '') {
                throw new Error('Empty response from server');
            }
            
            return JSON.parse(text);
            
        } catch (error) {
            console.error(`API Error (attempt ${attempt}/${retryCount}):`, error);
            
            if (attempt === retryCount) {
                return { success: false, error: error.toString() };
            }
            
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
}
