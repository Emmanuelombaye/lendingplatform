const http = require('http');
const https = require('https');

const url = 'https://vertexloans.onrender.com/api/public/settings';

console.log(`Checking ${url}...`);

const req = https.get(url, (res) => {
    console.log(`Status: ${res.statusCode}`);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (e) => {
    console.error(e);
});

req.setTimeout(5000, () => {
    console.log('Request timed out after 5s');
    req.destroy();
});
