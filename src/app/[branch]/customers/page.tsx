"use client";

import { SidebarLayout } from "@/components/SidebarLayout";
import { Search, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CustomersPage() {
  const params = useParams();
  const branchId = params.branch as string;
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomers() {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('branch_id', branchId)
        .order('last_order_date', { ascending: false, nullsFirst: false });
        
      if (!error && data) {
        setCustomers(data);
      }
      setLoading(false);
    }
    fetchCustomers();
  }, [branchId]);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.phone && c.phone.includes(searchTerm))
  );

  return (
    <SidebarLayout>
      <div className="flex flex-col gap-6 h-full pb-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-dark-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-brand-gold rounded-full inline-block"></span>
              Customers Directory
            </h2>
            <p className="text-sm text-dark-500 mt-1 pl-3.5 font-medium">Manage all your client contacts</p>
          </div>
          
          <button className="flex items-center gap-2 px-5 py-2.5 bg-dark-900 hover:bg-dark-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors shadow-sm">
            <UserPlus size={16} strokeWidth={2.5} />
            Add Customer
          </button>
        </div>

        {/* Global Search */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gold-200 flex items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold" size={18} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or phone number..." 
              className="w-full bg-gold-50 border border-gold-200 focus:border-brand-gold focus:bg-white rounded-xl pl-12 pr-4 py-3 outline-none transition-colors text-sm font-medium text-dark-900 placeholder-dark-400" 
            />
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gold-200 overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="bg-gold-50/50 border-b border-gold-200">
                  <th className="px-6 py-4 text-[10px] font-bold text-dark-500 uppercase tracking-widest">Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-dark-500 uppercase tracking-widest">Phone Number</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-dark-500 uppercase tracking-widest text-center">Orders</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-dark-500 uppercase tracking-widest text-right">Total Spent</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-dark-500 uppercase tracking-widest text-right">Last Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-dark-400 font-bold text-[10px] tracking-widest uppercase">
                      Loading customers...
                    </td>
                  </tr>
                ) : filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer, i) => (
                    <tr key={i} className="hover:bg-gold-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-dark-900 block">{customer.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-dark-600 tracking-widest">{customer.phone}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs font-bold bg-gold-100 text-brand-gold px-2.5 py-1 rounded-full">{customer.total_orders} Orders</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-black text-dark-900">₹{parseFloat(customer.total_spent || 0).toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-xs font-medium text-dark-500">{customer.last_order_date || 'Never'}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-dark-400 font-bold text-[10px] tracking-widest uppercase">
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
