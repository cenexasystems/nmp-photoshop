"use client";

import { AdminSidebarLayout } from "@/components/AdminSidebarLayout";
import { Calendar, TrendingUp, IndianRupee, FileText, Smartphone, Package, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("ALL TIME");
  const [tab, setTab] = useState("REVENUE");

  return (
    <AdminSidebarLayout>
      <div className="flex flex-col gap-6 h-full pb-10">
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-dark-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-brand-gold rounded-full inline-block"></span>
              POS Analytics
            </h2>
            <p className="text-sm text-dark-500 mt-1 pl-3.5 font-medium">Real-time store & channel insights</p>
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
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-gold-200 mt-2">
          {["REVENUE", "TODAY'S SALES", "PRODUCTS", "COUPONS"].map(t => (
            <button 
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "py-3 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-colors",
                tab === t ? "border-brand-gold text-brand-gold" : "border-transparent text-dark-500 hover:text-dark-900"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gold-200 flex flex-col justify-between group hover:border-brand-gold/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Total Revenue</span>
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <IndianRupee size={14} strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-dark-900">₹69,696</div>
              <div className="text-[9px] font-bold text-dark-400 mt-1 uppercase tracking-widest">POS + manual combined</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gold-200 flex flex-col justify-between group hover:border-brand-gold/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Completed Bills</span>
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText size={14} strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-dark-900">44</div>
              <div className="text-[9px] font-bold text-dark-400 mt-1 uppercase tracking-widest">POS + manual bills</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gold-200 flex flex-col justify-between group hover:border-brand-gold/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Offline Bills</span>
              <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                <Smartphone size={14} strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-dark-900">₹69,696</div>
              <div className="text-[9px] font-bold text-dark-400 mt-1 uppercase tracking-widest">Walk-in POS sales</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gold-200 flex flex-col justify-between group hover:border-brand-gold/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Online Bills</span>
              <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                <Package size={14} strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-dark-900">₹0</div>
              <div className="text-[9px] font-bold text-dark-400 mt-1 uppercase tracking-widest">Online POS sales</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gold-200 flex flex-col justify-between group hover:border-brand-gold/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Total Offline</span>
              <div className="w-6 h-6 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                <FileText size={12} strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <div className="text-xl font-black text-dark-900">44</div>
              <div className="text-[9px] font-bold text-dark-400 mt-1 uppercase tracking-widest">Walk-in orders</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gold-200 flex flex-col justify-between group hover:border-brand-gold/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Total Online</span>
              <div className="w-6 h-6 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileText size={12} strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <div className="text-xl font-black text-dark-900">0</div>
              <div className="text-[9px] font-bold text-dark-400 mt-1 uppercase tracking-widest">Online channel</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gold-200 flex flex-col justify-between group hover:border-brand-gold/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Items Sold</span>
              <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <ShoppingBag size={12} strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <div className="text-xl font-black text-dark-900">103</div>
              <div className="text-[9px] font-bold text-dark-400 mt-1 uppercase tracking-widest">From completed bills</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gold-200 flex flex-col justify-between group hover:border-brand-gold/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Avg Order Value</span>
              <div className="w-6 h-6 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                <TrendingUp size={12} strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <div className="text-xl font-black text-dark-900">₹1,584</div>
              <div className="text-[9px] font-bold text-dark-400 mt-1 uppercase tracking-widest">Per completed order</div>
            </div>
          </div>

        </div>

        {/* Charts & Bottom section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gold-200 p-6">
              <div className="mb-6">
                <h3 className="text-xs font-bold text-dark-900 tracking-widest uppercase">Revenue Trend <span className="text-brand-gold">2026</span></h3>
                <div className="flex items-end gap-3 mt-1">
                  <span className="text-2xl font-black text-dark-900">₹69,696</span>
                  <span className="text-[9px] font-bold bg-gold-50 text-brand-gold border border-brand-gold/20 rounded-full px-2 py-0.5 uppercase tracking-widest">Avg ₹5,000/mo</span>
                </div>
              </div>

              {/* Fake chart */}
              <div className="h-40 flex items-end justify-between gap-1 sm:gap-2 px-1 pb-4 border-b border-gold-100">
                {["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"].map((m, i) => (
                  <div key={m} className="flex flex-col items-center gap-2 flex-1 relative group">
                    <div className="w-full bg-gold-100 rounded-t-md transition-all relative group-hover:bg-brand-gold" style={{ height: i === 6 ? '120px' : '4px' }}>
                      {i === 6 && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-brand-gold tracking-widest">
                          ₹69.7k
                        </div>
                      )}
                    </div>
                    <span className="text-[8px] font-bold text-dark-400 uppercase tracking-widest">{m}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gold-200 p-6">
              <div className="mb-2">
                <h3 className="text-xs font-bold text-dark-900 tracking-widest uppercase">Revenue This Week <span className="text-dark-400 text-[9px]">(Wk 28)</span></h3>
                <div className="text-xs font-black text-brand-gold mt-1 tracking-wider">₹15,550</div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gold-200 p-6">
              <h3 className="text-xs font-bold text-dark-900 tracking-widest uppercase mb-5">Order Source</h3>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Offline</span>
                    <span className="text-sm font-black text-dark-900">44</span>
                  </div>
                  <div className="h-1.5 w-full bg-gold-50 rounded-full overflow-hidden border border-gold-100">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Online</span>
                    <span className="text-sm font-black text-dark-900">0</span>
                  </div>
                  <div className="h-1.5 w-full bg-gold-50 rounded-full overflow-hidden border border-gold-100">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gold-200 p-6">
              <h3 className="text-xs font-bold text-dark-900 tracking-widest uppercase mb-5">Top Items</h3>
              <div className="space-y-4">
                {[
                  { name: "Portrait Session", rev: "₹7,650", qty: "9 pcs" },
                  { name: "Custom Frame", rev: "₹6,800", qty: "8 pcs" },
                  { name: "Passport Copies", rev: "₹6,800", qty: "8 pcs" },
                  { name: "Pre-wedding", rev: "₹6,600", qty: "11 pcs" },
                  { name: "Acrylic Print", rev: "₹4,800", qty: "4 pcs" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-4 text-[9px] font-black text-gold-400">{i + 1}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-bold text-dark-900 tracking-wide uppercase">{item.name}</span>
                        <div className="text-right">
                          <div className="text-[10px] font-black text-brand-gold">{item.rev}</div>
                        </div>
                      </div>
                      <div className="h-1 w-full bg-gold-50 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-gold rounded-full" style={{ width: `${80 - i * 10}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </AdminSidebarLayout>
  );
}
