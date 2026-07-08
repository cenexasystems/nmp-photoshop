"use client";

import { SidebarLayout } from "@/components/SidebarLayout";
import { Calendar, TrendingUp, IndianRupee, FileText, Smartphone, Package, ShoppingBag, Trophy } from "lucide-react";
import { useState } from "react";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("ALL TIME");
  const [tab, setTab] = useState("REVENUE");

  return (
    <SidebarLayout>
      <div className="flex flex-col gap-6 h-full pb-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-[#5c4a16]">POS Analytics</h2>
            <p className="text-sm text-gold-700 mt-1">Real-time store & channel insights</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center bg-gold-200/50 rounded-full p-1 border border-gold-200">
              <span className="text-xs font-bold text-gold-800 px-3 uppercase tracking-wide">Period:</span>
              {["ALL TIME", "TODAY", "THIS WEEK", "THIS MONTH", "THIS YEAR"].map(p => (
                <button 
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all uppercase tracking-wide ${
                    period === p ? "bg-[#5c4a16] text-white shadow-sm" : "text-gold-700 hover:bg-gold-200"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-white border border-gold-200 rounded-full px-4 py-1.5 shadow-sm">
              <span className="text-xs font-bold text-gold-800 uppercase tracking-wide">From:</span>
              <span className="text-sm font-semibold">07/08/2026</span>
              <Calendar size={14} className="text-gold-500 ml-1" />
              <span className="text-xs font-bold text-gold-800 ml-2 uppercase tracking-wide">To:</span>
              <span className="text-sm font-semibold">07/08/2026</span>
              <Calendar size={14} className="text-gold-500 ml-1" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-gold-200">
          {["REVENUE", "TODAY'S SALES", "PRODUCTS", "COUPONS"].map(t => (
            <button 
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${
                tab === t ? "border-[#5c4a16] text-[#5c4a16]" : "border-transparent text-gold-600 hover:text-gold-800"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gold-200 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold text-gold-600 uppercase tracking-widest">Total Revenue</span>
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                <IndianRupee size={16} />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-dark-900">₹69,696</div>
              <div className="text-xs font-medium text-gold-600 mt-1">POS + manual combined</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gold-200 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold text-gold-600 uppercase tracking-widest">Completed Bills</span>
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                <FileText size={16} />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-dark-900">44</div>
              <div className="text-xs font-medium text-gold-600 mt-1">POS + manual bills</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gold-200 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold text-gold-600 uppercase tracking-widest">Offline Bills</span>
              <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                <Smartphone size={16} />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-dark-900">₹69,696</div>
              <div className="text-xs font-medium text-gold-600 mt-1">Walk-in POS sales</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gold-200 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold text-gold-600 uppercase tracking-widest">Online Bills</span>
              <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center">
                <Package size={16} />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-dark-900">₹0</div>
              <div className="text-xs font-medium text-gold-600 mt-1">Online POS sales</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gold-200 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold text-gold-600 uppercase tracking-widest">Total Offline Bills</span>
              <div className="w-6 h-6 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                <FileText size={12} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-dark-900">44</div>
              <div className="text-xs font-medium text-gold-600 mt-1">Walk-in POS orders</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gold-200 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold text-gold-600 uppercase tracking-widest">Total Online Bills</span>
              <div className="w-6 h-6 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center">
                <FileText size={12} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-dark-900">0</div>
              <div className="text-xs font-medium text-gold-600 mt-1">Online channel orders</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gold-200 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold text-gold-600 uppercase tracking-widest">Total Items Sold</span>
              <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center">
                <ShoppingBag size={12} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-dark-900">103</div>
              <div className="text-xs font-medium text-gold-600 mt-1">From completed bills</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gold-200 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold text-gold-600 uppercase tracking-widest">Avg Order Value</span>
              <div className="w-6 h-6 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
                <TrendingUp size={12} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-dark-900">₹1,584</div>
              <div className="text-xs font-medium text-gold-600 mt-1">Per completed order</div>
            </div>
          </div>

        </div>

        {/* Charts & Bottom section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gold-200">
              <div className="mb-8">
                <h3 className="text-sm font-bold text-dark-900">Revenue Trend This Year <span className="text-gold-500">2026</span></h3>
                <div className="flex items-end gap-3 mt-1">
                  <span className="text-2xl font-black text-dark-900">₹69,696</span>
                  <span className="text-[10px] font-bold bg-orange-50 text-orange-600 px-2 py-0.5 rounded border border-orange-100 uppercase tracking-wide">Avg ₹5,000/mo</span>
                </div>
              </div>

              {/* Fake chart */}
              <div className="h-48 flex items-end justify-between gap-2 px-2 pb-6 border-b border-gold-100">
                {["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"].map((m, i) => (
                  <div key={m} className="flex flex-col items-center gap-2 flex-1 relative group">
                    <div className="w-full bg-[#5c4a16] rounded-t-sm transition-all relative" style={{ height: i === 6 ? '120px' : '4px' }}>
                      {i === 6 && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-[#5c4a16]">
                          ₹69.7k
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-gold-500">{m}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gold-200">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-dark-900">Revenue This Week <span className="text-gold-500">(Week 28 of 2026)</span></h3>
                <div className="text-[10px] font-bold text-gold-500 mt-1">₹15,550 total</div>
              </div>
              {/* Fake weekly chart can go here */}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gold-200">
              <h3 className="text-sm font-bold text-dark-900 mb-6">Order Source</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Offline</span>
                    <span className="text-sm font-black text-dark-900">44</span>
                  </div>
                  <div className="h-2 w-full bg-gold-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Online</span>
                    <span className="text-sm font-black text-dark-900">0</span>
                  </div>
                  <div className="h-2 w-full bg-gold-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gold-200">
              <h3 className="text-sm font-bold text-dark-900 mb-6">Top Items by Revenue</h3>
              <div className="space-y-4">
                {[
                  { name: "Shirt", rev: "₹7,650", qty: "9 pcs" },
                  { name: "Plain Shirt", rev: "₹6,800", qty: "8 pcs" },
                  { name: "Shirt", rev: "₹6,800", qty: "8 pcs" },
                  { name: "Collar T Shirt", rev: "₹6,600", qty: "11 pcs" },
                  { name: "Pant", rev: "₹4,800", qty: "4 pcs" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 text-[10px] font-black text-gold-400">{i + 1}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-xs font-bold text-dark-900">{item.name}</span>
                        <div className="text-right">
                          <div className="text-xs font-black text-red-600">{item.rev}</div>
                          <div className="text-[9px] font-bold text-gold-500">{item.qty}</div>
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-gold-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#5c4a16] rounded-full" style={{ width: `${80 - i * 10}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </SidebarLayout>
  );
}
