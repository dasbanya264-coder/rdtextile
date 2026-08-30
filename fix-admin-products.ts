import fs from 'fs';
let content = fs.readFileSync('src/pages/admin/AdminProducts.tsx', 'utf8');

content = content.replace(
  "maxSizeMB: 0.8,\n          maxWidthOrHeight: 1600,\n          useWebWorker: true,\n          fileType: 'image/webp'",
  "maxSizeMB: 1.5,\n          maxWidthOrHeight: 1920,\n          useWebWorker: true,\n          fileType: 'image/webp',\n          initialQuality: 0.9"
);

fs.writeFileSync('src/pages/admin/AdminProducts.tsx', content);
