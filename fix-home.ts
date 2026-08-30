import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// We need to fetch settings in Home
if (!content.includes('const [bannerUrl, setBannerUrl]')) {
  // Add state
  content = content.replace(
    "const [loading, setLoading] = useState(true);",
    "const [loading, setLoading] = useState(true);\n  const [bannerUrl, setBannerUrl] = useState<string>('');"
  );
  
  // Add fetch to useEffect
  content = content.replace(
    "fetchTrending();",
    "fetchTrending();\n    \n    const fetchSettings = async () => {\n      try {\n        const docRef = await getDocs(query(collection(db, 'settings')));\n        docRef.docs.forEach(doc => {\n          if (doc.id === 'store' && doc.data().bannerUrl) {\n            setBannerUrl(doc.data().bannerUrl);\n          }\n        });\n      } catch (err) {}\n    };\n    fetchSettings();"
  );
  
  // Update img src
  content = content.replace(
    "src=\"/banner.png\"",
    "src={bannerUrl || 'https://images.unsplash.com/photo-1613843513180-87747e447545?q=80&w=2000&auto=format&fit=crop'}"
  );
  
  // Update img className to not be completely blown up on ultra-wide screens
  content = content.replace(
    "className=\"w-full h-auto block\"",
    "className=\"w-full h-auto max-h-[80vh] object-cover block\""
  );
  
  // Update onError
  content = content.replace(
    "e.currentTarget.src = \"https://images.unsplash.com/photo-1613843513180-87747e447545?q=80&w=2000&auto=format&fit=crop\";",
    "e.currentTarget.src = 'https://images.unsplash.com/photo-1613843513180-87747e447545?q=80&w=2000&auto=format&fit=crop';"
  );
  
  fs.writeFileSync('src/pages/Home.tsx', content);
}

let layoutContent = fs.readFileSync('src/components/layout/Layout.tsx', 'utf8');
if (!layoutContent.includes('logoUrl')) {
  layoutContent = layoutContent.replace(
    "import { Link, Outlet, useLocation } from 'react-router-dom';",
    "import { Link, Outlet, useLocation } from 'react-router-dom';\nimport { collection, getDocs, query } from 'firebase/firestore';\nimport { db } from '../../lib/firebase';"
  );
  
  layoutContent = layoutContent.replace(
    "const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);",
    "const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);\n  const [logoUrl, setLogoUrl] = useState<string>('');\n\n  useEffect(() => {\n    const fetchSettings = async () => {\n      try {\n        const docRef = await getDocs(query(collection(db, 'settings')));\n        docRef.docs.forEach(doc => {\n          if (doc.id === 'store' && doc.data().logoUrl) {\n            setLogoUrl(doc.data().logoUrl);\n          }\n        });\n      } catch (err) {}\n    };\n    fetchSettings();\n  }, []);"
  );
  
  layoutContent = layoutContent.replace(
    "src=\"/logo.png?v=4\"",
    "src={logoUrl || '/logo.png?v=4'}"
  );
  
  fs.writeFileSync('src/components/layout/Layout.tsx', layoutContent);
}

