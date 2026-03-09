const fs = require('fs');
const path = require('path');

function replaceInPath(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInPath(fullPath);
        } else if (file.match(/\.(tsx|ts|js|json|md|html)$/) && !fullPath.includes('node_modules')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;
            content = content.replace(/\bKES\b/g, 'TZS');
            content = content.replace(/\bKRA PIN\b/g, 'TIN');
            content = content.replace(/\bKRA\b/g, 'TRA'); // Tanzania Revenue Authority
            content = content.replace(/\bKenya\b/g, 'Tanzania');
            content = content.replace(/\bKsh\b/g, 'Tsh');
            if (content !== original) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated: ' + fullPath);
            }
        }
    }
}

replaceInPath('e:\\Ombaye1\\vertex\\vertexloans\\src');
replaceInPath('e:\\Ombaye1\\vertex\\vertexloans\\admin-portal');
replaceInPath('e:\\Ombaye1\\vertex\\vertexloans\\backend');
