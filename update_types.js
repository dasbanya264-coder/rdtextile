const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');
if (!content.includes('uploadedPhotos?: string[];')) {
  content = content.replace('transactionId?: string;', 'transactionId?: string;\n  uploadedPhotos?: string[];');
  fs.writeFileSync('src/types.ts', content);
}
