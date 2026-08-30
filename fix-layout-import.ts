import fs from 'fs';
let content = fs.readFileSync('src/components/layout/Layout.tsx', 'utf8');
if (!content.includes('useEffect')) {
  content = content.replace("import { useState } from 'react';", "import { useState, useEffect } from 'react';");
  fs.writeFileSync('src/components/layout/Layout.tsx', content);
}
