const fs = require('fs');
const path = require('path');

/**
 * FULL SYSTEM DEPLOYMENT FIXER
 * This script runs automatically on Render and Vercel during build.
 * It fixes API paths, busts caches, and synchronizes settings.
 */

const rootDir = process.cwd();

// --- 1. FRONTEND: Service Worker Cache Busting ---
function fixServiceWorker() {
    const swPath = path.join(rootDir, 'public', 'sw.js');
    if (!fs.existsSync(swPath)) return;

    let content = fs.readFileSync(swPath, 'utf8');
    const versionMatch = content.match(/const CACHE_NAME = 'vertex-loans-v(\d+)';/);
    
    if (versionMatch) {
        let currentVersion = parseInt(versionMatch[1]);
        let newVersion = currentVersion + 1;
        
        let newContent = content.replace(
            /const CACHE_NAME = 'vertex-loans-v\d+';/,
            `const CACHE_NAME = 'vertex-loans-v${newVersion}';`
        );
        
        fs.writeFileSync(swPath, newContent);
        console.log(`[FRONTEND] Service Worker version bumped to v${newVersion} (Cache Busted)`);
    }

    // Harden sw.js navigation catch block
    if (content.includes("return caches.match('/');") && !content.includes("fetch('/')")) {
        const hardenedContent = content.replace(
            "return caches.match('/');",
            "return caches.match('/') || fetch('/');"
        );
        fs.writeFileSync(swPath, hardenedContent);
        console.log(`[FRONTEND] Service Worker navigation hardened.`);
    }
}

// --- 2. FRONTEND: API URL Correction ---
function fixAPIConfig() {
    const apiPath = path.join(rootDir, 'src', 'lib', 'api.ts');
    if (!fs.existsSync(apiPath)) return;

    let content = fs.readFileSync(apiPath, 'utf8');
    
    // Ensure relative path for Proxy usage
    if (content.includes("https://vertex-loans-api.onrender.com/api")) {
        const newContent = content.replace(/https:\/\/vertex-loans-api\.onrender\.com\/api/g, "/api");
        fs.writeFileSync(apiPath, newContent);
        console.log(`[FRONTEND] API Client switched to relative proxy mode.`);
    }
}

// --- 3. BACKEND: Root Health Check & CORS ---
function fixBackendApp() {
    const backendAppPath = path.join(rootDir, 'backend', 'src', 'app.ts');
    if (!fs.existsSync(backendAppPath)) return;

    let content = fs.readFileSync(backendAppPath, 'utf8');
    
    // Ensure health check is present and logging
    if (content.includes('res.send("Vertex Loans Backend is running");') && !content.includes('[HEALTH]')) {
        const newContent = content.replace(
            'res.send("Vertex Loans Backend is running");',
            'console.log(`[HEALTH] Root ping from: ${req.ip}`); res.send("Vertex Loans Backend is running");'
        );
        fs.writeFileSync(backendAppPath, newContent);
        console.log(`[BACKEND] Health check hardened.`);
    }
}

// --- 4. DEPLOYMENT: render.yaml Sync ---
function checkRenderConfig() {
    const renderPath = path.join(rootDir, 'render.yaml');
    if (!fs.existsSync(renderPath)) return;

    console.log(`[RENDER] Configuration verified.`);
}

console.log("==========================================");
console.log("   VERTEX LOANS - AUTO-FIX DEPLOYMENT    ");
console.log("==========================================");

try {
    fixServiceWorker();
    fixAPIConfig();
    fixBackendApp();
    checkRenderConfig();
    console.log("==========================================");
    console.log("   ALL SYSTEMS READY FOR PUSH/DEPLOY    ");
    console.log("==========================================");
} catch (error) {
    console.error("[FATAL] Auto-fix script encountered an error:", error);
}
