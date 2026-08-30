import fs from 'fs';

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

if (!appContent.includes('AdminSettings')) {
  appContent = appContent.replace(
    "const AdminCustomers = React.lazy(() => import('./pages/admin/AdminCustomers'));",
    "const AdminCustomers = React.lazy(() => import('./pages/admin/AdminCustomers'));\nconst AdminSettings = React.lazy(() => import('./pages/admin/AdminSettings'));"
  );
  
  appContent = appContent.replace(
    "<Route path=\"customers\" element={<AdminCustomers />} />",
    "<Route path=\"customers\" element={<AdminCustomers />} />\n                <Route path=\"settings\" element={<AdminSettings />} />"
  );
  fs.writeFileSync('src/App.tsx', appContent);
}

let layoutContent = fs.readFileSync('src/components/layout/AdminLayout.tsx', 'utf8');
if (!layoutContent.includes('Settings')) {
  layoutContent = layoutContent.replace(
    "import { LayoutDashboard, ShoppingBag, Tags, Users, LogOut, Package, Menu, X } from 'lucide-react';",
    "import { LayoutDashboard, ShoppingBag, Tags, Users, LogOut, Package, Menu, X, Settings } from 'lucide-react';"
  );
  
  layoutContent = layoutContent.replace(
    "<Link onClick={() => setIsMobileMenuOpen(false)} to=\"/admin/customers\"",
    "<Link onClick={() => setIsMobileMenuOpen(false)} to=\"/admin/settings\" className=\"flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-stone-800 hover:text-white transition-colors\">\n            <Settings className=\"w-5 h-5\" /> Store Settings\n          </Link>\n          <Link onClick={() => setIsMobileMenuOpen(false)} to=\"/admin/customers\""
  );
  fs.writeFileSync('src/components/layout/AdminLayout.tsx', layoutContent);
}
