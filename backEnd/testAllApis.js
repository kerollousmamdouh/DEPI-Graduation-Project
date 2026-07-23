import http from 'http';

function get(path, headers = {}) {
    return new Promise((resolve, reject) => {
        const req = http.get('http://localhost:5000' + path, { headers: { 'Accept-Language': 'ar', ...headers } }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
                catch { resolve({ status: res.statusCode, data }); }
            });
        });
        req.on('error', reject);
        req.setTimeout(8000, () => { req.destroy(); reject(new Error('timeout')); });
    });
}

function post(path, body, headers = {}) {
    return new Promise((resolve, reject) => {
        const bodyStr = JSON.stringify(body);
        const req = http.request('http://localhost:5000' + path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept-Language': 'ar', ...headers },
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
                catch { resolve({ status: res.statusCode, data }); }
            });
        });
        req.on('error', reject);
        req.write(bodyStr);
        req.end();
    });
}

async function test() {
    console.log('\n=== 1. POST /api/auth/login (admin) ===');
    const login = await post('/api/auth/login', { username: 'admin', password: 'admin123' });
    console.log('Status:', login.status);
    const token = login.data?.token || login.data?.data?.token;
    console.log('Token:', token ? token.substring(0, 30) + '...' : 'NONE');
    const authH = token ? { Authorization: `Bearer ${token}` } : {};

    console.log('\n=== 2. GET /api/categories (public) ===');
    const cats = await get('/api/categories');
    console.log('Status:', cats.status, '| Count:', Array.isArray(cats.data) ? cats.data.length : 'NOT ARRAY');
    if (Array.isArray(cats.data) && cats.data.length > 0) {
        console.log('  Keys:', Object.keys(cats.data[0]).join(', '));
        console.log('  Sample:', JSON.stringify(cats.data[0]).substring(0, 200));
    }

    console.log('\n=== 3. GET /api/products (public) ===');
    const prods = await get('/api/products');
    console.log('Status:', prods.status, '| Count:', Array.isArray(prods.data) ? prods.data.length : 'NOT ARRAY');
    if (Array.isArray(prods.data) && prods.data.length > 0) {
        console.log('  Keys:', Object.keys(prods.data[0]).join(', '));
        console.log('  Sample:', JSON.stringify(prods.data[0]).substring(0, 200));
    }

    console.log('\n=== 4. GET /api/banners/active (public) ===');
    const banners = await get('/api/banners/active');
    console.log('Status:', banners.status, '| Count:', Array.isArray(banners.data) ? banners.data.length : 'NOT ARRAY');
    if (Array.isArray(banners.data) && banners.data.length > 0) {
        console.log('  Keys:', Object.keys(banners.data[0]).join(', '));
        console.log('  Sample:', JSON.stringify(banners.data[0]).substring(0, 200));
    }

    console.log('\n=== 5. GET /api/settings (public) ===');
    const settings = await get('/api/settings');
    console.log('Status:', settings.status);
    console.log('  Keys:', Object.keys(settings.data).join(', '));
    const footerInSettings = Object.keys(settings.data).filter(k => k.startsWith('footer_'));
    console.log('  Footer keys:', footerInSettings.length);

    console.log('\n=== 6. GET /api/footer-settings (public) ===');
    const footer = await get('/api/footer-settings');
    console.log('Status:', footer.status);
    console.log('  Full response:', JSON.stringify(footer.data).substring(0, 300));

    console.log('\n=== 7. GET /api/announcements/current (public) ===');
    const ann = await get('/api/announcements/current');
    console.log('Status:', ann.status, '| Data:', JSON.stringify(ann.data).substring(0, 100));

    console.log('\n=== 8. GET /api/payment-methods (public) ===');
    const pm = await get('/api/payment-methods');
    console.log('Status:', pm.status, '| Count:', Array.isArray(pm.data) ? pm.data.length : 'NOT ARRAY');

    console.log('\n=== 9. Auth endpoints (with token) ===');
    const profile = await get('/api/auth/profile', authH);
    console.log('  GET /auth/profile:', profile.status);

    console.log('\n=== 10. POST /api/auth/login as customer ===');
    const custLogin = await post('/api/auth/login', { username: 'customer', password: 'customer123' });
    console.log('Status:', custLogin.status);
    const custToken = custLogin.data?.token || custLogin.data?.data?.token;
    console.log('Token:', custToken ? custToken.substring(0, 30) + '...' : 'NONE');

    console.log('\n=== 11. GET /api/orders/my-orders (auth) ===');
    const custH = custToken ? { Authorization: `Bearer ${custToken}` } : {};
    const orders = await get('/api/orders/my-orders', custH);
    console.log('Status:', orders.status, '| Data:', JSON.stringify(orders.data).substring(0, 200));

    console.log('\n=== 12. GET /api/favorites (auth) ===');
    const favs = await get('/api/favorites', custH);
    console.log('Status:', favs.status, '| Count:', Array.isArray(favs.data) ? favs.data.length : 'NOT ARRAY');

    console.log('\n=== DONE ===');
    process.exit(0);
}

test().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
