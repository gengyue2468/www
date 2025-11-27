const fs = require('fs');
const path = require('path');

try {
  const buildInfo = { buildTime: new Date().toISOString() };
  const filePath = path.join(process.cwd(), 'public', 'build-info.json');
  fs.writeFileSync(filePath, JSON.stringify(buildInfo, null, 2));
  console.log('Wrote build time to', filePath);
} catch (err) {
  console.error('Failed to write build time:', err);
  process.exit(1);
}
