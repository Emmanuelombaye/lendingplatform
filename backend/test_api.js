const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function test() {
    console.log('--- STARTING API VERIFICATION ---');

    try {
        // 1. Test Public Settings
        console.log('\n[1/3] Testing Public Settings...');
        const settingsRes = await axios.get(`${BASE_URL}/public/settings`);
        console.log('✅ Settings Data:', JSON.stringify(settingsRes.data.data));

        // 2. Test User Registration
        console.log('\n[2/3] Testing User Registration...');
        const email = `test_${Date.now()}@example.com`;
        const registerRes = await axios.post(`${BASE_URL}/auth/register`, {
            fullName: 'Test User',
            email: email,
            phone: `07${Math.floor(Math.random() * 89999999) + 10000000}`,
            password: 'Password123!'
        });

        if (registerRes.data.success) {
            console.log('✅ Registration Successful for:', email);
            const token = registerRes.data.data.token;

            // 3. Test Application Creation
            console.log('\n[3/3] Testing Application Creation...');
            const appRes = await axios.post(`${BASE_URL}/applications/create`,
                { loanAmount: 50000, repaymentPeriod: 12 },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (appRes.data.success) {
                console.log('✅ Application Created Successfully. ID:', appRes.data.data.id);
            } else {
                console.log('❌ Application Creation Failed:', appRes.data.message);
            }
        } else {
            console.log('❌ Registration Failed:', registerRes.data.message);
        }

        // 4. Test Admin Login
        console.log('\n[4/4] Testing Admin Login...');
        try {
            const adminRes = await axios.post(`${BASE_URL}/admin/login`, {
                email: 'vertex@loans.com',
                password: '@Kenya90!132323'
            });
            if (adminRes.data.success) {
                console.log('✅ Admin Login Successful. Token received.');
                const adminToken = adminRes.data.data.token;

                const allApps = await axios.get(`${BASE_URL}/admin/applications`, {
                    headers: { Authorization: `Bearer ${adminToken}` }
                });
                console.log('✅ Admin Applications Fetched. Header count:', allApps.data.data?.length || 0);
            } else {
                console.log('❌ Admin Login Failed:', adminRes.data.message);
            }
        } catch (adminErr) {
            console.log('❌ Admin Login Error:', adminErr.response?.data?.message || adminErr.message);
        }

    } catch (error) {
        console.error('❌ API Test Error:', error.response?.data || error.message);
    }

    console.log('\n--- VERIFICATION COMPLETE ---');
}

test();
