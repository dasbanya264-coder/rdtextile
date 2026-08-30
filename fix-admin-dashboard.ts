import fs from 'fs';

let content = `import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Package, TrendingUp, Users, ShoppingBag } from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import type { Order, Product, UserProfile } from '../../types';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    todaysSales: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    customers: 0,
    products: 0,
    lowStock: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch Orders
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        
        // Fetch Products
        const productsSnap = await getDocs(collection(db, 'products'));
        const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        
        // Fetch Customers
        const usersSnap = await getDocs(collection(db, 'users'));
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let totalSales = 0;
        let todaysSales = 0;
        let pending = 0;
        let delivered = 0;
        
        // Generate last 7 days for chart
        const last7Days = Array.from({length: 7}, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return {
            date: d.toLocaleDateString('en-US', { weekday: 'short' }),
            fullDate: d.toISOString().split('T')[0],
            sales: 0,
            orders: 0
          };
        });

        orders.forEach(order => {
          if (order.paymentStatus === 'paid' || order.paymentMethod === 'cod') {
            totalSales += order.total;
            
            const orderDate = new Date(order.createdAt);
            if (orderDate >= today) {
              todaysSales += order.total;
            }
            
            // Populate chart data
            const dateStr = order.createdAt.split('T')[0];
            const dayData = last7Days.find(d => d.fullDate === dateStr);
            if (dayData) {
              dayData.sales += order.total;
              dayData.orders += 1;
            }
          }
          
          if (order.status === 'pending' || order.status === 'processing') pending++;
          if (order.status === 'delivered') delivered++;
        });

        let lowStockCount = products.filter(p => p.stockQuantity < 5).length;

        setStats({
          totalSales,
          todaysSales,
          totalOrders: orders.length,
          pendingOrders: pending,
          deliveredOrders: delivered,
          customers: usersSnap.size,
          products: products.length,
          lowStock: lowStockCount
        });
        
        setSalesData(last7Days);

        // Recent orders
        const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRecentOrders(sortedOrders.slice(0, 5));

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Revenue', value: formatPrice(stats.totalSales), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: "Today's Sales", value: formatPrice(stats.todaysSales), icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: Package, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Customers', value: stats.customers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Low Stock Items', value: stats.lowStock, icon: Package, color: 'text-red-600', bg: 'bg-red-50' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif text-stone-900 mb-2">Dashboard Overview</h1>
          <p className="text-stone-500 text-sm">Welcome back to Ripan Saree Center Admin</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4">
            <div className={\`w-14 h-14 rounded-xl flex items-center justify-center \${stat.bg} \${stat.color}\`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-400 mb-1 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-serif text-stone-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <h3 className="text-lg font-serif text-stone-900 mb-6">Revenue Overview (Last 7 Days)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#78716c', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#78716c', fontSize: 12 }} tickFormatter={(val) => \`₹\${val}\`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e7e5e4', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [formatPrice(value), 'Revenue']}
                />
                <Area type="monotone" dataKey="sales" stroke="#d97706" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-serif text-stone-900">Recent Orders</h3>
          </div>
          <div className="flex-1 overflow-auto">
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex justify-between items-center p-3 hover:bg-stone-50 rounded-lg transition-colors border border-stone-100">
                    <div>
                      <p className="text-sm font-medium text-stone-900">#{order.id.slice(-6).toUpperCase()}</p>
                      <p className="text-xs text-stone-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-stone-900">{formatPrice(order.total)}</p>
                      <p className={\`text-[10px] font-bold uppercase tracking-widest \${
                        order.status === 'delivered' ? 'text-emerald-600' :
                        order.status === 'processing' ? 'text-blue-600' :
                        order.status === 'cancelled' ? 'text-red-600' :
                        'text-amber-600'
                      }\`}>
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone-500 text-center py-8">No recent orders found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', content);
