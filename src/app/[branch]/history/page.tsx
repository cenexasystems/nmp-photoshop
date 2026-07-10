"use client";

import { SidebarLayout } from "@/components/SidebarLayout";
import { Search, Calendar, Download, X } from "lucide-react";
import { useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ORDERS = [
  { id: "INV-2026-4NPIP", customer: "Chakra", phone: "7538985660", source: "OFFLINE", total: 538, status: "Paid", product: "Portrait", date: "2026-07-08", paymentMode: "Cash", deliveryStatus: "Delivered", details: "1 Frame, 8x10", idNumber: "" },
  { id: "INV-2026-6OFIH", customer: "Madhavan", phone: "9790591365", source: "OFFLINE", total: 1500, status: "Unpaid", product: "Passport", date: "2026-07-07", paymentMode: "GPay", deliveryStatus: "Pending", details: "32 Copies", idNumber: "Z983948" },
  { id: "INV-2026-KKTVU", customer: "Madhavan", phone: "9790591365", source: "OFFLINE", total: 1800, status: "Partial", product: "Photo Shoot", date: "2026-07-06", paymentMode: "Card", deliveryStatus: "In Progress", details: "Pre-wedding shoot", idNumber: "" },
  { id: "INV-2026-KDTGV", customer: "Madhava", phone: "9790591365", source: "OFFLINE", total: 1500, status: "Paid", product: "Frame", date: "2026-07-06", paymentMode: "Cash", deliveryStatus: "Delivered", details: "Large Wooden Frame", idNumber: "" },
  { id: "INV-2026-OQZ22", customer: "Kupu", phone: "6009705582", source: "OFFLINE", total: 3900, status: "Paid", product: "Gift", date: "2026-07-05", paymentMode: "Bank Transfer", deliveryStatus: "Delivered", details: "Custom Mug", idNumber: "" },
  { id: "INV-2026-1LV83", customer: "John", phone: "9884408727", source: "ONLINE", total: 800, status: "Unpaid", product: "Print", date: "2026-07-05", paymentMode: "Others", deliveryStatus: "Pending", details: "10 A4 Prints", idNumber: "" },
];

export default function HistoryPage() {
  const [period, setPeriod] = useState("ALL TIME");
  const [globalSearch, setGlobalSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL STATUS");
  const [selectedOrder, setSelectedOrder] = useState<typeof ORDERS[0] | null>(null);

  const filteredOrders = ORDERS.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(globalSearch.toLowerCase()) ||
      order.customer.toLowerCase().includes(globalSearch.toLowerCase()) ||
      order.phone.includes(globalSearch) ||
      order.product.toLowerCase().includes(globalSearch.toLowerCase());
      
    const matchesStatus = statusFilter === "ALL STATUS" || order.status.toUpperCase() === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <SidebarLayout>
      <div className="flex flex-col gap-6 h-full pb-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-dark-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-brand-gold rounded-full inline-block"></span>
              Order History
            </h2>
            <p className="text-sm text-dark-500 mt-1 pl-3.5 font-medium">Manage and track past invoices</p>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <div className="flex flex-wrap items-center justify-end gap-2 w-full">
              <div className="flex items-center gap-2 bg-white border border-gold-200 rounded-full px-4 py-1.5 shadow-sm">
                <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">From</span>
                <span className="text-xs font-bold text-dark-900">07/08/2026</span>
                <Calendar size={14} className="text-brand-gold ml-1" />
                <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest ml-2">To</span>
                <span className="text-xs font-bold text-dark-900">07/08/2026</span>
                <Calendar size={14} className="text-brand-gold ml-1" />
              </div>
              <div className="flex items-center bg-white rounded-full p-1 border border-gold-200 shadow-sm">
                <span className="text-[10px] font-bold text-dark-500 px-3 uppercase tracking-widest hidden sm:inline">Period</span>
                {["ALL TIME", "TODAY", "THIS WEEK", "THIS MONTH", "THIS YEAR"].map(p => (
                  <button 
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-[10px] font-bold transition-all uppercase tracking-widest",
                      period === p ? "bg-brand-gold text-white shadow-sm" : "text-dark-600 hover:bg-gold-50"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <button className="flex items-center gap-2 px-5 py-2 bg-white hover:bg-gold-50 text-dark-900 border border-gold-200 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors shadow-sm">
              <Download size={14} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Global Search & Filter */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gold-200 flex flex-wrap gap-4 items-center">
          <div className="flex-1 w-full md:w-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold" size={18} />
            <input 
              type="text" 
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search by Order ID, Customer Name, Phone, or Product..." 
              className="w-full bg-gold-50 border border-gold-200 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-brand-gold focus:bg-white text-sm font-medium text-dark-900 placeholder-dark-400 transition-colors" 
            />
          </div>
          <div className="w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-48 bg-gold-50 border border-gold-200 rounded-xl px-4 py-3 outline-none focus:border-brand-gold focus:bg-white text-xs font-bold text-dark-900 uppercase tracking-widest transition-colors cursor-pointer"
            >
              <option value="ALL STATUS">All Status</option>
              <option value="PAID">Paid (Completed)</option>
              <option value="PARTIAL">Partial</option>
              <option value="UNPAID">Unpaid (Pending)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gold-200 overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gold-50/50 border-b border-gold-200">
                  <th className="px-6 py-4 text-[10px] font-bold text-dark-500 uppercase tracking-widest">Date / Order ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-dark-500 uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-dark-500 uppercase tracking-widest">Product</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-dark-500 uppercase tracking-widest">Total Due</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-dark-500 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-100">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order, i) => (
                    <tr key={i} className="hover:bg-gold-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-[10px] font-bold text-dark-400 mb-1 tracking-widest">{order.date}</div>
                        <span className="text-sm font-bold text-dark-900">{order.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-dark-900 block">{order.customer}</span>
                        <span className="text-[10px] font-bold text-dark-400 tracking-widest">{order.phone}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-dark-900 uppercase">{order.product}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-dark-900">₹{order.total.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-4">
                          <div className="flex flex-col items-end">
                            <span className={cn("text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-1",
                              order.status === "Paid" ? "bg-emerald-100 text-emerald-700" :
                              order.status === "Unpaid" ? "bg-red-100 text-red-700" :
                              "bg-amber-100 text-amber-700"
                            )}>
                              {order.status}
                            </span>
                          </div>
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="text-[10px] font-bold text-brand-gold hover:text-dark-900 uppercase tracking-widest transition-colors"
                          >
                            Details →
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-dark-400 font-bold text-[10px] tracking-widest uppercase">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-dark-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gold-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gold-100 bg-gold-50/50">
              <h3 className="text-sm font-bold text-dark-900 tracking-widest uppercase flex items-center gap-2">
                <span className="w-1.5 h-4 bg-brand-gold rounded-full"></span>
                Order Details
              </h3>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-dark-400 hover:text-dark-900 transition-colors p-1"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="flex justify-between items-start pb-4 border-b border-gold-100">
                <div>
                  <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-1">Order ID</div>
                  <div className="font-bold text-dark-900 text-sm">{selectedOrder.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-1">Date</div>
                  <div className="font-bold text-dark-900 text-sm">{selectedOrder.date}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gold-100">
                <div>
                  <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-1">Customer</div>
                  <div className="font-bold text-dark-900 text-sm">{selectedOrder.customer}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-1">Phone</div>
                  <div className="font-bold text-dark-900 text-sm">{selectedOrder.phone}</div>
                </div>
              </div>

              <div className="bg-gold-50 rounded-xl p-4 border border-gold-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-1">Product</div>
                    <div className="font-bold text-brand-gold uppercase text-sm">{selectedOrder.product}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-1">Total Amount</div>
                    <div className="font-black text-dark-900 text-lg">₹{selectedOrder.total.toLocaleString()}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-1">Details</div>
                    <div className="font-medium text-dark-900 text-sm">{selectedOrder.details || "-"}</div>
                  </div>
                  {selectedOrder.idNumber && (
                    <div className="col-span-2 pt-1">
                      <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-1">ID Number</div>
                      <div className="font-bold text-dark-900 text-sm">{selectedOrder.idNumber}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-1">Payment Mode</div>
                  <div className="font-bold text-dark-900 text-xs uppercase">{selectedOrder.paymentMode}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-1">Amt Status</div>
                  <div className="font-bold text-dark-900 text-xs uppercase">{selectedOrder.status}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-1">Delivery</div>
                  <div className="font-bold text-dark-900 text-xs uppercase">{selectedOrder.deliveryStatus}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </SidebarLayout>
  );
}
