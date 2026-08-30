import fs from 'fs';
let content = fs.readFileSync('src/components/layout/AdminLayout.tsx', 'utf8');

if (!content.includes('logoUrl')) {
  content = content.replace("import { useState } from 'react';", "import { useState, useEffect } from 'react';\nimport { collection, getDocs, query } from 'firebase/firestore';");
  
  content = content.replace(
    "const handleLogout = async () => {",
    "const [logoUrl, setLogoUrl] = useState<string>('');\n  useEffect(() => {\n    const fetchSettings = async () => {\n      try {\n        const docRef = await getDocs(query(collection(db, 'settings')));\n        docRef.docs.forEach(doc => {\n          if (doc.id === 'store' && doc.data().logoUrl) {\n            setLogoUrl(doc.data().logoUrl);\n          }\n        });\n      } catch (err) {}\n    };\n    fetchSettings();\n  }, []);\n\n  const handleLogout = async () => {"
  );
  
  content = content.replace(/src="\/logo\.png\?v=4"/g, "src={logoUrl || '/logo.png?v=4'}");
  fs.writeFileSync('src/components/layout/AdminLayout.tsx', content);
}
