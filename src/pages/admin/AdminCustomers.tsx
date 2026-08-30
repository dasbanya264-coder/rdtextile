import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { UserProfile } from '../../types';
import { Shield, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const MAIN_ADMIN_EMAIL = 'rd919665@gmail.com';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const customerData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
      setCustomers(customerData);
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const toggleRole = async (customer: UserProfile) => {
    // Only main admin can change roles
    if (userProfile?.email !== MAIN_ADMIN_EMAIL) {
      alert("Only the Main Admin (Ripan Das) has permission to add or remove other Admins.");
      return;
    }

    // Main admin cannot demote themselves
    if (customer.email === MAIN_ADMIN_EMAIL) {
      alert("The Main Admin cannot be demoted to a customer.");
      return;
    }

    try {
      const newRole = customer.role === 'admin' ? 'customer' : 'admin';
      await updateDoc(doc(db, 'users', customer.id), { role: newRole });
      fetchCustomers();
    } catch (err) {
      console.error("Error updating role:", err);
      alert("Failed to update role. Please try again.");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-serif text-stone-900 mb-8">Customers</h1>

      <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-6 py-4 text-sm font-medium text-stone-500 uppercase whitespace-nowrap">Name</th>
                <th className="px-6 py-4 text-sm font-medium text-stone-500 uppercase whitespace-nowrap">Email</th>
                <th className="px-6 py-4 text-sm font-medium text-stone-500 uppercase whitespace-nowrap">Role</th>
                <th className="px-6 py-4 text-sm font-medium text-stone-500 uppercase whitespace-nowrap">Joined</th>
                <th className="px-6 py-4 text-sm font-medium text-stone-500 uppercase text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-stone-500">Loading customers...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-stone-500">No customers found.</td></tr>
              ) : (
                customers.map(customer => (
                  <tr key={customer.id} className="hover:bg-stone-50">
                    <td className="px-6 py-4 font-medium text-stone-900 whitespace-nowrap">{customer.name}</td>
                    <td className="px-6 py-4 text-stone-600 whitespace-nowrap">
                      {customer.email} 
                      {customer.email === MAIN_ADMIN_EMAIL && <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Main Admin</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-max ${customer.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-stone-100 text-stone-800'}`}>
                        {customer.role === 'admin' && <Shield className="w-3 h-3" />}
                        {customer.role === 'admin' ? 'Admin' : 'Customer'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600 whitespace-nowrap">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {customer.email !== MAIN_ADMIN_EMAIL ? (
                        <button 
                          onClick={() => toggleRole(customer)}
                          className={`text-xs font-medium border px-3 py-1 rounded transition-colors ${
                            userProfile?.email === MAIN_ADMIN_EMAIL 
                              ? 'text-amber-600 hover:text-amber-700 border-amber-200 hover:bg-amber-50' 
                              : 'text-stone-400 border-stone-200 cursor-not-allowed'
                          }`}
                          title={userProfile?.email !== MAIN_ADMIN_EMAIL ? "Only Main Admin can change roles" : ""}
                        >
                          Make {customer.role === 'admin' ? 'Customer' : 'Admin'}
                        </button>
                      ) : (
                        <span className="text-xs text-stone-400 italic">Protected</span>
                      )}
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
