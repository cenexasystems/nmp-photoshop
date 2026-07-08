"use client";

import { SidebarLayout } from "@/components/SidebarLayout";
import { Search, Calendar, Download, X } from "lucide-react";
import { useState } from "react";

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
  const [selectedOrder, setSelectedOrder] = useState<typeof ORDERS[0] | null>(null);

  return (
    <SidebarLayout>
      <div className="flex flex-col gap-6 h-full pb-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-[#5c4a16]">Order History</h2>
            <p className="text-sm text-gold-700 mt-1">Manage and track past invoices</p>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            {/* Period and Date filters - Right aligned */}
            <div className="flex flex-wrap items-center justify-end gap-2 w-full">
              <div className="flex items-center gap-2 bg-white border border-gold-200 rounded-full px-4 py-1.5 shadow-sm">
                <span className="text-xs font-bold text-gold-800 uppercase tracking-wide">From:</span>
                <span className="text-sm font-semibold">07/08/2026</span>
                <Calendar size={14} className="text-gold-500 ml-1" />
                <span className="text-xs font-bold text-gold-800 ml-2 uppercase tracking-wide">To:</span>
                <span className="text-sm font-semibold">07/08/2026</span>
                <Calendar size={14} className="text-gold-500 ml-1" />
              </div>
              <div className="flex items-center bg-gold-200/50 rounded-full p-1 border border-gold-200">
                <span className="text-xs font-bold text-gold-800 px-3 uppercase tracking-wide hidden sm:inline">Period:</span>
                {["ALL TIME", "TODAY", "THIS WEEK", "THIS MONTH", "THIS YEAR"].map(p => (
                  <button 
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all uppercase tracking-wide ${
                      period === p ? "bg-[#5c4a16] text-white shadow-sm" : "text-gold-700 hover:bg-gold-200"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Export CSV - Below Period */}
            <button className="flex items-center gap-2 px-5 py-2 bg-white hover:bg-gold-50 text-[#5c4a16] border border-[#5c4a16] rounded-full text-xs font-bold uppercase tracking-wide transition-colors shadow-sm">
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Global Search Filter */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gold-200 flex flex-wrap gap-4 items-center">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-400" size={18} />
            <input 
              type="text" 
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search by Order ID, Customer Name, Phone, or Product..." 
              className="w-full bg-gold-50 border border-gold-200 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-gold-400 text-sm font-medium" 
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gold-200 overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gold-50 border-b border-gold-200">
                  <th className="px-6 py-4 text-xs font-bold text-gold-800 uppercase tracking-wider">Date / Order ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-gold-800 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold text-gold-800 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-xs font-bold text-gold-800 uppercase tracking-wider">Total Due</th>
                  <th className="px-6 py-4 text-xs font-bold text-gold-800 uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-100">
                {ORDERS.map((order, i) => (
                  <tr key={i} className="hover:bg-gold-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-gold-600 mb-1">{order.date}</div>
                      <span className="text-sm font-bold text-[#5c4a16]">{order.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-dark-900 block">{order.customer}</span>
                      <span className="text-[10px] font-medium text-gold-600">{order.phone}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-dark-900">{order.product}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-dark-900">₹{order.total.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <div className="flex flex-col items-end">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border mb-1 ${
                            order.status === "Paid" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                            order.status === "Unpaid" ? "bg-red-50 text-red-600 border-red-200" :
                            "bg-amber-50 text-amber-600 border-amber-200"
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="text-xs font-bold text-gold-600 hover:text-[#5c4a16] uppercase tracking-wide underline underline-offset-4 decoration-gold-300"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gold-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gold-100 bg-gold-50/50">
              <h3 className="text-lg font-bold text-[#5c4a16]">Order Details</h3>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-gold-500 hover:text-dark-900 transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="flex justify-between items-start pb-4 border-b border-gold-100">
                <div>
                  <div className="text-xs font-bold text-gold-500 uppercase tracking-wider mb-1">Order ID</div>
                  <div className="font-bold text-dark-900">{selectedOrder.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-gold-500 uppercase tracking-wider mb-1">Date</div>
                  <div className="font-bold text-dark-900">{selectedOrder.date}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gold-100">
                <div>
                  <div className="text-xs font-bold text-gold-500 uppercase tracking-wider mb-1">Customer</div>
                  <div className="font-bold text-dark-900">{selectedOrder.customer}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-gold-500 uppercase tracking-wider mb-1">Phone</div>
                  <div className="font-bold text-dark-900">{selectedOrder.phone}</div>
                </div>
              </div>

              <div className="bg-gold-50 rounded-xl p-4 border border-gold-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-bold text-gold-500 uppercase tracking-wider mb-1">Product</div>
                    <div className="font-bold text-[#5c4a16]">{selectedOrder.product}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gold-500 uppercase tracking-wider mb-1">Total Amount</div>
                    <div className="font-black text-dark-900">₹{selectedOrder.total.toLocaleString()}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[10px] font-bold text-gold-500 uppercase tracking-wider mb-1">Details</div>
                    <div className="font-medium text-dark-900">{selectedOrder.details || "-"}</div>
                  </div>
                  {selectedOrder.idNumber && (
                    <div className="col-span-2">
                      <div className="text-[10px] font-bold text-gold-500 uppercase tracking-wider mb-1">ID Number</div>
                      <div className="font-bold text-dark-900">{selectedOrder.idNumber}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-[10px] font-bold text-gold-500 uppercase tracking-wider mb-1">Payment Mode</div>
                  <div className="font-bold text-dark-900">{selectedOrder.paymentMode}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gold-500 uppercase tracking-wider mb-1">Amt Status</div>
                  <div className="font-bold text-dark-900">{selectedOrder.status}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gold-500 uppercase tracking-wider mb-1">Delivery</div>
                  <div className="font-bold text-dark-900">{selectedOrder.deliveryStatus}</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </SidebarLayout>
  );
}
