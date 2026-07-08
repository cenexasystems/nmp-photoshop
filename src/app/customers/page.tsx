"use client";

import { SidebarLayout } from "@/components/SidebarLayout";
import { Search, UserPlus } from "lucide-react";
import { useState } from "react";

const CUSTOMERS = [
  { name: "Chakra", phone: "7538985660" },
  { name: "Madhavan", phone: "9790591365" },
  { name: "Madhava", phone: "9790591365" },
  { name: "Kupu", phone: "6009705582" },
  { name: "John", phone: "9884408727" },
  { name: "Mohan kumar", phone: "6588272206" },
  { name: "Rajasekhar", phone: "9994665784" },
  { name: "Ramday", phone: "7824858523" },
];

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = CUSTOMERS.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  return (
    <SidebarLayout>
      <div className="flex flex-col gap-6 h-full pb-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-[#5c4a16]">Customers Directory</h2>
            <p className="text-sm text-gold-700 mt-1">Manage all your client contacts</p>
          </div>
          
          <button className="flex items-center gap-2 px-5 py-2 bg-[#5c4a16] hover:bg-gold-900 text-white rounded-full text-xs font-bold uppercase tracking-wide transition-colors shadow-sm">
            <UserPlus size={16} />
            Add Customer
          </button>
        </div>

        {/* Global Search */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gold-200 flex items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-400" size={18} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Name or Phone Number..." 
              className="w-full bg-gold-50 border border-gold-200 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-gold-400 text-sm font-medium" 
            />
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gold-200 overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gold-50 border-b border-gold-200">
                  <th className="px-8 py-5 text-xs font-bold text-gold-800 uppercase tracking-wider">Name</th>
                  <th className="px-8 py-5 text-xs font-bold text-gold-800 uppercase tracking-wider">Phone Number</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-100">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer, i) => (
                    <tr key={i} className="hover:bg-gold-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <span className="text-sm font-bold text-dark-900 block">{customer.name}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-medium text-gold-700">{customer.phone}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-8 py-10 text-center text-gold-500 font-medium">
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
