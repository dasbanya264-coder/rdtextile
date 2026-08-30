import fs from 'fs';

let content = fs.readFileSync('src/components/layout/Layout.tsx', 'utf8');

if (!content.includes('useNetworkStatus')) {
  content = content.replace(
    "import BottomNav from './BottomNav';",
    "import BottomNav from './BottomNav';\nimport { useNetworkStatus } from '../../hooks/useNetworkStatus';\nimport { WifiOff } from 'lucide-react';"
  );
  
  content = content.replace(
    "export default function Layout() {",
    "export default function Layout() {\n  const isOnline = useNetworkStatus();"
  );
  
  content = content.replace(
    "<main className=\"flex-grow pt-16 safe-area-pb\">",
    `{!isOnline && (
        <div className="fixed top-16 left-0 right-0 z-50 bg-red-500 text-white px-4 py-2 text-center text-sm font-medium shadow-md flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          You are offline. Please check your internet connection.
        </div>
      )}
      <main className="flex-grow pt-16 safe-area-pb">`
  );
  
  fs.writeFileSync('src/components/layout/Layout.tsx', content);
}
