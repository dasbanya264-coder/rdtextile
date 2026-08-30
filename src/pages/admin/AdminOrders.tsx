import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { Order } from '../../types';
import { formatPrice } from '../../lib/utils';
import { Package, Truck, CheckCircle, XCircle, Printer, Search } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'orders'));
      const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      
      // Sort by creation date descending
      ordersData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setOrders(ordersData);
      setFilteredOrders(ordersData);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOrders(orders);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      const filtered = orders.filter(order => 
        order.id.toLowerCase().includes(lowercasedTerm) ||
        order.shippingAddress.fullName.toLowerCase().includes(lowercasedTerm) ||
        order.shippingAddress.phone.includes(lowercasedTerm)
      );
      setFilteredOrders(filtered);
    }
  }, [searchTerm, orders]);

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      fetchOrders();
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  const updatePaymentStatus = async (orderId: string, newPaymentStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { paymentStatus: newPaymentStatus });
      fetchOrders();
    } catch (err) {
      console.error("Error updating payment status:", err);
    }
  };

  const handlePrintLabel = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow pop-ups to print the label.");
      return;
    }
    
    const html = `
      <html>
        <head>
          <title>Shipping Label - Order #${order.id.slice(-6).toUpperCase()}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; border: 2px dashed #000; }
            h1 { font-size: 24px; text-align: center; margin-bottom: 20px; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .section { margin-bottom: 15px; }
            .label { font-size: 12px; color: #666; font-weight: bold; text-transform: uppercase; }
            .value { font-size: 18px; font-weight: bold; margin-top: 4px; }
            .address { font-size: 16px; line-height: 1.5; margin-top: 4px; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; border-top: 1px solid #ccc; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h1>Ripan Saree Center<br><span style="font-size: 14px; font-weight: normal;">Shipping Label</span></h1>
          
          <div class="section">
            <div class="label">Order ID</div>
            <div class="value">#${order.id.slice(-6).toUpperCase()}</div>
          </div>
          
          <div class="section">
            <div class="label">Deliver To</div>
            <div class="value">${order.shippingAddress.fullName}</div>
            <div class="value" style="font-size: 16px;">Ph: ${order.shippingAddress.phone}</div>
          </div>
          
          <div class="section">
            <div class="label">Shipping Address</div>
            <div class="address">
              ${order.shippingAddress.street}<br/>
              ${order.shippingAddress.village ? order.shippingAddress.village + '<br/>' : ''}
              ${order.shippingAddress.district}, ${order.shippingAddress.state}<br/>
              <strong>PIN: ${order.shippingAddress.pinCode}</strong>
            </div>
          </div>
          
          <div class="section">
            <div class="label">Payment Status</div>
            <div class="value" style="font-size: 16px;">${order.paymentMethod.toUpperCase()} - ${order.paymentStatus.toUpperCase()}</div>
            ${order.paymentMethod === 'cod' ? '<div style="font-size: 18px; font-weight: bold; margin-top: 5px; border: 1px solid #000; padding: 5px; text-align: center;">COLLECT CASH: Rs. ' + order.total + '</div>' : ''}
          </div>
          
          <div class="footer">
            If undelivered, please return to Ripan Saree Center
          </div>
          <script>
            window.onload = function() { window.print(); setTimeout(function(){ window.close(); }, 500); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const getStatusBadge = (status: Order['status']) => {
    switch(status) {
      case 'pending': return <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">Pending</span>;
      case 'processing': return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Processing</span>;
      case 'shipped': return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">Shipped</span>;
      case 'delivered': return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Delivered</span>;
      case 'cancelled': return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Cancelled</span>;
      default: return null;
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-serif text-stone-900">Orders</h1>
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search name, phone, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-6 py-4 text-sm font-medium text-stone-500 uppercase whitespace-nowrap">Order Details</th>
                <th className="px-6 py-4 text-sm font-medium text-stone-500 uppercase whitespace-nowrap">Customer</th>
                <th className="px-6 py-4 text-sm font-medium text-stone-500 uppercase whitespace-nowrap">Date</th>
                <th className="px-6 py-4 text-sm font-medium text-stone-500 uppercase whitespace-nowrap">Total</th>
                <th className="px-6 py-4 text-sm font-medium text-stone-500 uppercase whitespace-nowrap">Status</th>
                <th className="px-6 py-4 text-sm font-medium text-stone-500 uppercase text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-stone-500">Loading orders...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-stone-500">No orders found.</td></tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-stone-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-stone-900 mb-1">#{order.id.slice(-6).toUpperCase()}</div>
                      <div className="text-sm text-stone-500">{order.items.length} items</div>{order.uploadedPhotos && order.uploadedPhotos.length > 0 && (<div className="mt-2 flex gap-1 flex-wrap">{order.uploadedPhotos.map((url, i) => (<a key={i} href={url} target="_blank" rel="noopener noreferrer"><img src={url} alt="Attachment" className="w-10 h-10 object-cover rounded border border-stone-200 hover:border-amber-500 transition-colors" /></a>))}</div>)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-stone-900 font-medium">{order.shippingAddress.fullName}</div>
                      <div className="text-xs text-stone-600 font-medium">{order.shippingAddress.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-stone-900">{formatPrice(order.total)}</div>
                      <div className="text-xs text-stone-500 uppercase flex items-center gap-2 mt-1">
                        <span>{order.paymentMethod} •</span>
                        <select
                          value={order.paymentStatus}
                          onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                          className={`text-xs font-medium border rounded p-1 ${
                            order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                            order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800 border-red-200' :
                            'bg-amber-100 text-amber-800 border-amber-200'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                        </select>
                      </div>
                      {order.transactionId && (
                        <div className="text-[10px] text-stone-400 mt-1 uppercase">Txn: {order.transactionId}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end gap-2">
                        <select 
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                          className="text-sm border border-stone-300 rounded p-1 block bg-white w-full max-w-[120px]"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button 
                          onClick={() => handlePrintLabel(order)}
                          className="flex items-center justify-center gap-1.5 w-full max-w-[120px] px-2 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" /> Print Label
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
