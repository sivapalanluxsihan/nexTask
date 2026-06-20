const fs = require('fs');
const path = require('path');

function copyHtml(srcDir, distDir) {
  if (!fs.existsSync(srcDir)) return;
  fs.mkdirSync(distDir, { recursive: true });
  fs.readdirSync(srcDir, { withFileTypes: true }).forEach((dirent) => {
    const srcPath = path.join(srcDir, dirent.name);
    const distPath = path.join(distDir, dirent.name);
    if (dirent.isDirectory()) {
      copyHtml(srcPath, distPath);
    } else if (dirent.isFile() && dirent.name.endsWith('.html')) {
      fs.copyFileSync(srcPath, distPath);
    }
  });
}

const srcTemplates = path.join(__dirname, '../templates');
const distTemplates = path.join(__dirname, '../../dist/templates');

console.log(`📋 Copying HTML templates from ${srcTemplates} to ${distTemplates}...`);
copyHtml(srcTemplates, distTemplates);
console.log('✅ HTML templates copied successfully.');
