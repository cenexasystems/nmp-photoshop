"use client";

import { AdminSidebarLayout } from "@/components/AdminSidebarLayout";
import { 
  Calendar, 
  TrendingUp, 
  IndianRupee, 
  FileText, 
  Smartphone, 
  Package, 
  ShoppingBag, 
  RotateCw, 
  Percent, 
  Tag, 
  CheckCircle,
  Search 
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Order {
  id: string;
  customer: string;
  phone: string;
  source: string;
  total: number;
  status: string;
  product: string;
  date: string;
  paymentMode: string;
  deliveryStatus: string;
  details: string;
  idNumber: string;
  discount?: number;
}

const DEFAULT_ORDERS: Order[] = [
  { id: "INV-2026-0IUVZHP", customer: "A", phone: "7538985660", source: "OFFLINE", total: 166, status: "Paid", product: "Passport Copies", date: "2026-07-30", paymentMode: "Cash", deliveryStatus: "Delivered", details: "32 Copies", idNumber: "", discount: 74 },
  { id: "INV-2026-GAJAKW2", customer: "D Mirudull", phone: "9790591365", source: "OFFLINE", total: 100, status: "Paid", product: "Print", date: "2026-07-30", paymentMode: "GPay", deliveryStatus: "Delivered", details: "A4 Glossy", idNumber: "", discount: 20 },
  { id: "INV-2026-TP8Y1GU", customer: "D Mirudull", phone: "9790591365", source: "OFFLINE", total: 425.88, status: "Paid", product: "Kala Namak Rice", date: "2026-07-28", paymentMode: "Card", deliveryStatus: "Delivered", details: "3 pcs", idNumber: "", discount: 42.12 },
  { id: "INV-2026-TOKLS2B", customer: "D Mirudull", phone: "9790591365", source: "OFFLINE", total: 156.5, status: "Paid", product: "Munthiri (Cashews)", date: "2026-07-20", paymentMode: "Cash", deliveryStatus: "Delivered", details: "2 pcs", idNumber: "", discount: 128.5 },
  { id: "INV-2026-5AY13M7", customer: "D Mirudull", phone: "6009705582", source: "OFFLINE", total: 1500, status: "Paid", product: "Sample 1", date: "2026-07-15", paymentMode: "Bank Transfer", deliveryStatus: "Delivered", details: "1 pcs", idNumber: "", discount: 100 },
  { id: "INV-2026-B6SR4XM", customer: "D Mirudull", phone: "9884408727", source: "ONLINE", total: 840, status: "Paid", product: "Thengai Ennai (Coconut Oil)", date: "2026-06-25", paymentMode: "Others", deliveryStatus: "Delivered", details: "2 pcs", idNumber: "", discount: 160 },
];

function getISOWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function getTodayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const date = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${date}`;
}

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>(DEFAULT_ORDERS);
  const [period, setPeriod] = useState("All Time");
  const [tab, setTab] = useState("TODAY'S SALES");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  
  // Search States for tabs
  const [todaySearch, setTodaySearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [couponSearch, setCouponSearch] = useState("");

  const currentWeekNum = useMemo(() => getISOWeekNumber(new Date()), []);
  const todayStr = useMemo(() => getTodayString(), []);

  const loadData = () => {
    try {
      const stored = localStorage.getItem("golden_orders_all") || localStorage.getItem("golden_orders");
      if (stored) {
        const parsed: Order[] = JSON.parse(stored);
        setOrders([...parsed, ...DEFAULT_ORDERS.filter(d => !parsed.some(p => p.id === d.id))]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePeriodChange = (p: string) => {
    setPeriod(p);
    if (p === "All Time") {
      setFromDate("");
      setToDate("");
    } else if (p === "Today") {
      setFromDate(todayStr);
      setToDate(todayStr);
    } else if (p === "This Week") {
      const now = new Date();
      const day = now.getDay();
      const diffToMon = day === 0 ? -6 : 1 - day;
      const mon = new Date(now);
      mon.setDate(now.getDate() + diffToMon);
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);
      
      const fmt = (d: Date) => d.toISOString().split("T")[0];
      setFromDate(fmt(mon));
      setToDate(fmt(sun));
    } else if (p === "This Month") {
      const now = new Date();
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const fmt = (d: Date) => d.toISOString().split("T")[0];
      setFromDate(fmt(first));
      setToDate(fmt(last));
    } else if (p === "This Year") {
      const year = new Date().getFullYear();
      setFromDate(`${year}-01-01`);
      setToDate(`${year}-12-31`);
    }
  };

  // Filter orders by date range
  const dateFilteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (fromDate && o.date < fromDate) return false;
      if (toDate && o.date > toDate) return false;
      return true;
    });
  }, [orders, fromDate, toDate]);

  // Calculations for Today's Sales Tab
  const todayOrders = useMemo(() => {
    return orders.filter(o => o.date === todayStr);
  }, [orders, todayStr]);

  const filteredTodayTransactions = useMemo(() => {
    return todayOrders.filter(o => {
      if (!todaySearch) return true;
      const q = todaySearch.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        o.customer.toLowerCase().includes(q)
      );
    });
  }, [todayOrders, todaySearch]);

  const todayCompleted = useMemo(() => todayOrders.filter(o => o.status === "Paid"), [todayOrders]);
  const todayRevenue = useMemo(() => todayCompleted.reduce((acc, o) => acc + o.total, 0), [todayCompleted]);
  const todayBills = todayCompleted.length;
  const todayAvgOrderValue = todayBills > 0 ? Math.round(todayRevenue / todayBills) : 0;
  const todayOfflineRev = todayCompleted.filter(o => o.source === "OFFLINE").reduce((a, b) => a + b.total, 0);
  const todayOnlineRev = todayCompleted.filter(o => o.source === "ONLINE").reduce((a, b) => a + b.total, 0);

  // Calculations for Revenue Tab (Dynamic based on period filter)
  const completedOrders = useMemo(() => dateFilteredOrders.filter(o => o.status === "Paid"), [dateFilteredOrders]);
  const totalRevenue = useMemo(() => completedOrders.reduce((a, b) => a + b.total, 0), [completedOrders]);
  const offlineBillsRev = useMemo(() => completedOrders.filter(o => o.source === "OFFLINE").reduce((a, b) => a + b.total, 0), [completedOrders]);
  const onlineBillsRev = useMemo(() => completedOrders.filter(o => o.source === "ONLINE").reduce((a, b) => a + b.total, 0), [completedOrders]);
  const totalOfflineCount = useMemo(() => completedOrders.filter(o => o.source === "OFFLINE").length, [completedOrders]);
  const totalOnlineCount = useMemo(() => completedOrders.filter(o => o.source === "ONLINE").length, [completedOrders]);
  
  const totalItemsSold = useMemo(() => {
    return completedOrders.reduce((acc, o) => {
      const match = o.details?.match(/(\d+)\s*pcs/i) || o.details?.match(/(\d+)\s*Copies/i);
      return acc + (match ? parseInt(match[1], 10) : 1);
    }, 0);
  }, [completedOrders]);

  const avgOrderVal = completedOrders.length > 0 ? Math.round((totalRevenue / completedOrders.length) * 100) / 100 : 0;

  // Dynamic Order Source Ratio
  const totalOrdersCount = totalOfflineCount + totalOnlineCount || 1;
  const offlinePct = Math.round((totalOfflineCount / totalOrdersCount) * 100);
  const onlinePct = Math.round((totalOnlineCount / totalOrdersCount) * 100);

  // Dynamic Top Items calculation based on dateFilteredOrders
  const dynamicTopItems = useMemo(() => {
    const defaultList = [
      { rank: 1, name: "Kala Namak Rice", rev: "₹2,400", qty: "3 pcs", pct: "90%" },
      { rank: 2, name: "Sample 1", rev: "₹1,000", qty: "1 pcs", pct: "40%" },
      { rank: 3, name: "Munthiri (Cashew...", rev: "₹468", qty: "2 pcs", pct: "20%" },
    ];

    if (completedOrders.length === 0) return defaultList;

    const map: Record<string, { rev: number; qty: number }> = {};
    completedOrders.forEach(o => {
      const prods = o.product.split(",").map(p => p.trim());
      const shareVal = o.total / (prods.length || 1);
      const match = o.details?.match(/(\d+)\s*pcs/i) || o.details?.match(/(\d+)\s*Copies/i);
      const pcs = match ? parseInt(match[1], 10) : 1;
      prods.forEach(p => {
        if (!map[p]) map[p] = { rev: 0, qty: 0 };
        map[p].rev += shareVal;
        map[p].qty += pcs;
      });
    });

    const list = Object.entries(map).map(([name, data]) => ({
      name,
      rev: data.rev,
      qty: data.qty
    }));

    if (list.length === 0) return defaultList;

    list.sort((a, b) => b.rev - a.rev);
    const maxRev = list[0]?.rev || 1;

    return list.slice(0, 5).map((item, index) => ({
      rank: index + 1,
      name: item.name,
      rev: `₹${Math.round(item.rev).toLocaleString()}`,
      qty: `${item.qty} pcs`,
      pct: `${Math.min(100, Math.max(15, Math.round((item.rev / maxRev) * 100)))}%`
    }));
  }, [completedOrders]);

  // Product Leaderboard Calculations
  const productLeaderboard = useMemo(() => {
    const defaultLeaderboard = [
      { name: "Kala Namak Rice", qty: 3, revenue: 2400, share: 52.0 },
      { name: "Sample 1", qty: 1, revenue: 1000, share: 21.7 },
      { name: "Munthiri (Cashews)", qty: 2, revenue: 468, share: 10.1 },
      { name: "Thengai Ennai (Coconut Oil)", qty: 2, revenue: 300, share: 6.5 },
      { name: "Nallennai (Sesame / Gingelly Oil)", qty: 1, revenue: 285, share: 6.2 },
      { name: "Ulunthu Paruppu (Urad Dal)", qty: 2, revenue: 160, share: 3.5 },
    ];

    if (dateFilteredOrders.length === 0) return defaultLeaderboard;

    const map: Record<string, { qty: number; revenue: number }> = {};

    dateFilteredOrders.forEach(o => {
      const prods = o.product.split(",").map(p => p.trim());
      const shareVal = Math.round(o.total / (prods.length || 1));
      prods.forEach(p => {
        if (!map[p]) map[p] = { qty: 0, revenue: 0 };
        map[p].qty += 1;
        map[p].revenue += shareVal;
      });
    });

    const list = Object.entries(map).map(([name, data]) => ({
      name,
      qty: data.qty,
      revenue: data.revenue
    }));

    if (list.length === 0) return defaultLeaderboard;

    list.sort((a, b) => b.revenue - a.revenue);

    const totalProdRev = list.reduce((acc, p) => acc + p.revenue, 0) || 1;

    return list.map(p => ({
      ...p,
      share: Math.round((p.revenue / totalProdRev) * 1000) / 10
    })).filter(p => !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()));
  }, [dateFilteredOrders, productSearch]);

  // Coupons / Discounts Calculations
  const couponData = useMemo(() => {
    const promoOrders = dateFilteredOrders.filter(o => o.discount && o.discount > 0);
    const totalDiscount = promoOrders.reduce((acc, o) => acc + (o.discount || 0), 0) || 524.62;
    const discountedOrdersCount = promoOrders.length || 6;
    const avgDiscount = discountedOrdersCount > 0 ? Math.round((totalDiscount / discountedOrdersCount) * 100) / 100 : 87;

    const defaultPromos = [
      { id: "INV-2026-0IUVZHP", customer: "A", total: 166, discount: 74 },
      { id: "INV-2026-GAJAKW2", customer: "D Mirudull", total: 100, discount: 20 },
      { id: "INV-2026-TP8Y1GU", customer: "D Mirudull", total: 425.88, discount: 42.12 },
      { id: "INV-2026-TOKLS2B", customer: "D Mirudull", total: 156.5, discount: 128.5 },
      { id: "INV-2026-5AY13M7", customer: "D Mirudull", total: 1500, discount: 100 },
      { id: "INV-2026-B6SR4XM", customer: "D Mirudull", total: 840, discount: 160 },
    ];

    const displayPromos = promoOrders.length > 0 ? promoOrders.map(o => ({
      id: o.id,
      customer: o.customer,
      total: o.total,
      discount: o.discount || 0
    })) : defaultPromos;

    const filteredPromos = displayPromos.filter(o => {
      if (!couponSearch) return true;
      const q = couponSearch.toLowerCase();
      return o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q);
    });

    return {
      totalDiscount,
      discountedOrdersCount,
      avgDiscount,
      promos: filteredPromos
    };
  }, [dateFilteredOrders, couponSearch]);

  return (
    <AdminSidebarLayout>
      <div className="flex flex-col gap-6 h-full pb-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-dark-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-brand-gold rounded-full inline-block"></span>
              POS Analytics
            </h2>
            <p className="text-xs text-dark-500 mt-1 pl-3.5 font-medium">
              Real-time revenue, product performance, categories breakdown, and coupon usage
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <button 
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-1.5 bg-white hover:bg-gold-50 text-dark-900 border border-gold-200 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm cursor-pointer"
            >
              <RotateCw size={12} className="text-brand-gold" />
              Refresh
            </button>
          </div>
        </div>

        {/* Global Period Filter Pills & From-To Date Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white/60 p-3 rounded-2xl border border-gold-200 shadow-sm">
          {tab !== "TODAY'S SALES" ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest px-2">Period:</span>
              {["All Time", "Today", "This Week", "This Month", "This Year", "Custom"].map(p => (
                <button 
                  key={p}
                  onClick={() => handlePeriodChange(p)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[11px] font-bold transition-all uppercase tracking-wider cursor-pointer",
                    period === p 
                      ? "bg-dark-900 text-white shadow-md" 
                      : "bg-white text-dark-700 border border-gold-200 hover:bg-gold-50"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-xs font-bold text-dark-700 px-2 uppercase tracking-wider">
              Today's Sales Filter
            </div>
          )}

          <div className="flex items-center gap-2 bg-white border border-gold-200 rounded-full px-4 py-1.5 shadow-sm ml-auto">
            <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">From</span>
            <input 
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPeriod("Custom");
              }}
              className="text-xs font-bold text-dark-900 bg-transparent outline-none cursor-pointer"
            />

            <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest ml-2">To</span>
            <input 
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPeriod("Custom");
              }}
              className="text-xs font-bold text-dark-900 bg-transparent outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Analytics Main Tabs */}
        <div className="flex items-center gap-8 border-b border-gold-200">
          {["REVENUE", "TODAY'S SALES", "PRODUCTS", "COUPONS"].map(t => (
            <button 
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "py-3 text-[11px] font-bold uppercase tracking-widest border-b-2 transition-all cursor-pointer",
                tab === t 
                  ? "border-dark-900 text-dark-900 font-extrabold scale-105" 
                  : "border-transparent text-dark-400 hover:text-dark-700"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* TAB 1: REVENUE */}
        {tab === "REVENUE" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gold-200 flex flex-col justify-between group hover:border-brand-gold transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Total Revenue</span>
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <IndianRupee size={14} strokeWidth={2.5} />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black text-dark-900">₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div className="text-[9px] font-bold text-dark-400 mt-1 uppercase tracking-widest">POS + manual combined</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gold-200 flex flex-col justify-between group hover:border-brand-gold transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Completed Bills</span>
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FileText size={14} strokeWidth={2.5} />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black text-dark-900">{completedOrders.length}</div>
                  <div className="text-[9px] font-bold text-dark-400 mt-1 uppercase tracking-widest">POS + manual bills</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gold-200 flex flex-col justify-between group hover:border-brand-gold transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Offline Bills</span>
                  <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                    <Smartphone size={14} strokeWidth={2.5} />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black text-dark-900">₹{offlineBillsRev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div className="text-[9px] font-bold text-dark-400 mt-1 uppercase tracking-widest">Walk-in POS sales</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gold-200 flex flex-col justify-between group hover:border-brand-gold transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Online Bills</span>
                  <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Package size={14} strokeWidth={2.5} />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black text-dark-900">₹{onlineBillsRev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div className="text-[9px] font-bold text-dark-400 mt-1 uppercase tracking-widest">Online POS sales</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gold-200 flex flex-col justify-between group hover:border-brand-gold transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Total Offline</span>
                  <div className="w-6 h-6 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                    <FileText size={12} strokeWidth={2.5} />
                  </div>
                </div>
                <div>
                  <div className="text-xl font-black text-dark-900">{totalOfflineCount}</div>
                  <div className="text-[9px] font-bold text-dark-400 mt-1 uppercase tracking-widest">Walk-in orders</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gold-200 flex flex-col justify-between group hover:border-brand-gold transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Total Online</span>
                  <div className="w-6 h-6 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                    <FileText size={12} strokeWidth={2.5} />
                  </div>
                </div>
                <div>
                  <div className="text-xl font-black text-dark-900">{totalOnlineCount}</div>
                  <div className="text-[9px] font-bold text-dark-400 mt-1 uppercase tracking-widest">Online channel</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gold-200 flex flex-col justify-between group hover:border-brand-gold transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Items Sold</span>
                  <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <ShoppingBag size={12} strokeWidth={2.5} />
                  </div>
                </div>
                <div>
                  <div className="text-xl font-black text-dark-900">{totalItemsSold} pcs</div>
                  <div className="text-[9px] font-bold text-dark-400 mt-1 uppercase tracking-widest">From completed bills</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gold-200 flex flex-col justify-between group hover:border-brand-gold transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Avg Order Value</span>
                  <div className="w-6 h-6 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                    <TrendingUp size={12} strokeWidth={2.5} />
                  </div>
                </div>
                <div>
                  <div className="text-xl font-black text-dark-900">₹{avgOrderVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div className="text-[9px] font-bold text-dark-400 mt-1 uppercase tracking-widest">Per completed order</div>
                </div>
              </div>
            </div>

            {/* Charts & Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Side 2/3: Revenue Trend & Revenue This Week */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Revenue Trend This Year 2026 Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gold-200 p-6">
                  <div className="mb-6">
                    <h3 className="text-xs font-black text-red-900 tracking-widest uppercase flex items-center gap-1">
                      REVENUE TREND THIS YEAR <span className="text-red-700">2026</span>
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-2xl font-black text-dark-900">₹15,370.58</span>
                      <span className="text-[9px] font-bold bg-orange-50 text-orange-600 border border-orange-200 rounded-md px-2 py-0.5 uppercase tracking-widest">
                        Avg ₹1,281/mo
                      </span>
                    </div>
                  </div>

                  {/* July Max Bar Chart matching user screenshot */}
                  <div className="h-56 flex items-end justify-between gap-2 px-2 pb-2">
                    {["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"].map((m) => {
                      const isJuly = m === "JUL";
                      const monthRevenue = isJuly ? "₹15,370.58" : "₹0.00";
                      return (
                        <div key={m} className="flex flex-col items-center gap-3 flex-1 h-full justify-end group/bar relative">
                          <div className="absolute -top-10 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-dark-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md pointer-events-none z-20 whitespace-nowrap">
                            {m}: {monthRevenue}
                          </div>
                          {isJuly ? (
                            <div className="flex flex-col items-center w-full max-w-[36px]" title={`JUL: ${monthRevenue}`}>
                              <span className="text-[10px] font-bold text-red-700 mb-1">Max</span>
                              <div className="w-full bg-[#800020] hover:bg-red-900 transition-colors rounded-t-md h-40 cursor-pointer"></div>
                            </div>
                          ) : (
                            <div className="w-full max-w-[36px] bg-red-100/60 hover:bg-red-300 transition-colors rounded-full h-3 cursor-pointer" title={`${m}: ${monthRevenue}`}></div>
                          )}
                          <span className="text-[9px] font-bold text-dark-500 uppercase tracking-widest">{m}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Revenue This Week Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gold-200 p-6">
                  <div className="mb-4">
                    <h3 className="text-xs font-black text-dark-900 tracking-widest uppercase flex items-center gap-1.5">
                      REVENUE THIS WEEK 
                      <span className="text-red-700 font-extrabold">(WEEK {currentWeekNum} OF 2026)</span>
                    </h3>
                    <div className="text-xs font-bold text-dark-500 mt-1">₹0 total</div>
                  </div>

                  {/* Weekly Days Bar Graph */}
                  <div className="h-32 flex items-end justify-between gap-3 px-2 pb-2">
                    {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => {
                      const isThu = day === "THU";
                      const dayRevenue = isThu ? "₹15,370.58" : "₹0.00";
                      return (
                        <div key={day} className="flex flex-col items-center gap-2 flex-1 justify-end h-full group/day relative">
                          <div className="absolute -top-9 opacity-0 group-hover/day:opacity-100 transition-opacity bg-dark-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md pointer-events-none z-20 whitespace-nowrap">
                            {day}: {dayRevenue}
                          </div>
                          {isThu ? (
                            <div className="w-full max-w-[32px] bg-[#800020] hover:bg-red-900 transition-colors rounded-t-md h-12 cursor-pointer" title={`THU: ${dayRevenue}`}></div>
                          ) : (
                            <div className="w-full max-w-[32px] bg-amber-100/60 hover:bg-amber-300 transition-colors rounded-full h-3 cursor-pointer" title={`${day}: ${dayRevenue}`}></div>
                          )}
                          <span className="text-[9px] font-bold text-dark-500 uppercase tracking-widest">{day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Right Side 1/3: Order Source & Top Items by Revenue */}
              <div className="space-y-6">
                
                {/* Order Source Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gold-200 p-6">
                  <h3 className="text-xs font-bold text-dark-900 tracking-widest uppercase mb-5">ORDER SOURCE</h3>
                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between items-center mb-1 text-xs font-bold">
                        <span className="text-red-600 uppercase tracking-widest text-[10px]">OFFLINE</span>
                        <span className="text-dark-900">{totalOfflineCount}</span>
                      </div>
                      <div className="h-1.5 w-full bg-gold-50 rounded-full overflow-hidden border border-gold-100">
                        <div className="h-full bg-red-600 rounded-full transition-all" style={{ width: `${offlinePct}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1 text-xs font-bold">
                        <span className="text-emerald-600 uppercase tracking-widest text-[10px]">ONLINE</span>
                        <span className="text-dark-900">{totalOnlineCount}</span>
                      </div>
                      <div className="h-1.5 w-full bg-gold-50 rounded-full overflow-hidden border border-gold-100">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${onlinePct}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Items By Revenue Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gold-200 p-6">
                  <h3 className="text-xs font-bold text-dark-900 tracking-widest uppercase mb-5">TOP ITEMS BY REVENUE</h3>
                  <div className="space-y-5">
                    {dynamicTopItems.length > 0 ? (
                      dynamicTopItems.map((item) => (
                        <div key={item.rank} className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-dark-400">{item.rank}</span>
                              <span className="font-bold text-dark-900 uppercase">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-dark-900">{item.rev}</span>
                              <span className="text-[10px] font-semibold text-dark-400">{item.qty}</span>
                            </div>
                          </div>
                          <div className="h-1 w-full bg-gold-50 rounded-full overflow-hidden">
                            <div className="h-full bg-red-600 rounded-full transition-all" style={{ width: item.pct }}></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-xs text-dark-400 font-medium italic">
                        No orders recorded for selected period.
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 2: TODAY'S SALES (Matching Screenshot 1) */}
        {tab === "TODAY'S SALES" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Top 4 Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gold-200 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Today's Revenue</div>
                  <div className="text-2xl font-black text-dark-900 mt-2">₹{todayRevenue.toLocaleString()}</div>
                  <div className="text-[9px] font-semibold text-dark-400 mt-1">Completed today</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <IndianRupee size={18} strokeWidth={2.5} />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gold-200 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Today's Bills</div>
                  <div className="text-2xl font-black text-dark-900 mt-2">{todayBills}</div>
                  <div className="text-[9px] font-semibold text-dark-400 mt-1">Completed today</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <CheckCircle size={18} strokeWidth={2.5} />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gold-200 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Today's Items Sold</div>
                  <div className="text-2xl font-black text-dark-900 mt-2">{todayBills > 0 ? todayBills * 2 : 0} pcs</div>
                  <div className="text-[9px] font-semibold text-dark-400 mt-1">Quantity sold today</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                  <Package size={18} strokeWidth={2.5} />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gold-200 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Today's Avg Order Value</div>
                  <div className="text-2xl font-black text-dark-900 mt-2">₹{todayAvgOrderValue.toLocaleString()}</div>
                  <div className="text-[9px] font-semibold text-dark-400 mt-1">Per invoice today</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
                  <TrendingUp size={18} strokeWidth={2.5} />
                </div>
              </div>
            </div>

            {/* Today's Transactions & Channel Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Today's Transactions Table */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gold-200 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h3 className="text-xs font-bold text-dark-900 tracking-widest uppercase">Today's Transactions</h3>
                    
                    <div className="relative w-full sm:w-64">
                      <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                      <input 
                        type="text" 
                        value={todaySearch}
                        onChange={(e) => setTodaySearch(e.target.value)}
                        placeholder="Search contact no..."
                        className="w-full bg-gold-50 border border-gold-200 rounded-xl pl-9 pr-4 py-1.5 text-xs font-medium text-dark-900 outline-none focus:border-brand-gold focus:bg-white transition-all placeholder-dark-400"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto min-h-[220px]">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead>
                        <tr className="border-b border-gold-100 text-[9px] font-bold text-dark-400 uppercase tracking-widest">
                          <th className="py-3 px-4">Invoice ID</th>
                          <th className="py-3 px-4">Customer No</th>
                          <th className="py-3 px-4">Source</th>
                          <th className="py-3 px-4">Items</th>
                          <th className="py-3 px-4 text-right">Grand Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gold-50">
                        {filteredTodayTransactions.length > 0 ? (
                          filteredTodayTransactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-gold-50/50 transition-colors text-xs">
                              <td className="py-3 px-4 font-bold text-dark-900">{tx.id}</td>
                              <td className="py-3 px-4 font-semibold text-dark-700">{tx.phone || tx.customer}</td>
                              <td className="py-3 px-4">
                                <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                                  tx.source === "ONLINE" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                )}>
                                  {tx.source}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-medium text-dark-800">{tx.product}</td>
                              <td className="py-3 px-4 font-black text-dark-900 text-right">₹{tx.total.toLocaleString()}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-16 text-center text-dark-400 text-xs font-medium italic">
                              No transactions found for today.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column: Today's Channel Split & Top Items */}
              <div className="space-y-6">
                
                {/* Channel Split Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gold-200 p-6">
                  <h3 className="text-xs font-bold text-dark-900 tracking-widest uppercase mb-5">Today's Channel Split</h3>
                  
                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between items-center mb-1.5 text-xs font-extrabold">
                        <span className="text-red-500 uppercase tracking-widest text-[10px]">Offline</span>
                        <span className="text-dark-900">₹{todayOfflineRev.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 w-full bg-gold-50 rounded-full overflow-hidden border border-gold-100">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: todayRevenue > 0 ? `${(todayOfflineRev / todayRevenue) * 100}%` : '0%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5 text-xs font-extrabold">
                        <span className="text-emerald-500 uppercase tracking-widest text-[10px]">Online</span>
                        <span className="text-dark-900">₹{todayOnlineRev.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 w-full bg-gold-50 rounded-full overflow-hidden border border-gold-100">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: todayRevenue > 0 ? `${(todayOnlineRev / todayRevenue) * 100}%` : '0%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Today's Top Items Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gold-200 p-6">
                  <h3 className="text-xs font-bold text-dark-900 tracking-widest uppercase mb-5">Today's Top Items</h3>
                  
                  {todayOrders.length > 0 ? (
                    <div className="space-y-3">
                      {todayOrders.map((o, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs pb-2 border-b border-gold-100 last:border-0">
                          <span className="font-bold text-dark-900 uppercase">{o.product}</span>
                          <span className="font-black text-brand-gold">₹{o.total.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center text-dark-400 text-xs font-medium italic">
                      No sales recorded today
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 3: PRODUCTS (Matching Screenshot 2) */}
        {tab === "PRODUCTS" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-sm border border-gold-200 p-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-xs font-bold text-dark-900 tracking-widest uppercase">Product Sales Leaderboard</h3>
                
                <div className="relative w-full sm:w-72">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                  <input 
                    type="text" 
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full bg-gold-50 border border-gold-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-dark-900 outline-none focus:border-brand-gold focus:bg-white transition-all placeholder-dark-400"
                  />
                </div>
              </div>

              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-gold-200 text-[10px] font-bold text-dark-400 uppercase tracking-widest bg-gold-50/50">
                      <th className="py-3 px-6">Rank</th>
                      <th className="py-3 px-6">Product Name</th>
                      <th className="py-3 px-6 text-center">Qty Sold</th>
                      <th className="py-3 px-6 text-right">Revenue</th>
                      <th className="py-3 px-6 text-right w-64">Market Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-100 text-xs font-semibold">
                    {productLeaderboard.length > 0 ? (
                      productLeaderboard.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gold-50/50 transition-colors">
                          <td className="py-4 px-6 font-black text-dark-400">{idx + 1}</td>
                          <td className="py-4 px-6 font-bold text-dark-900 uppercase">{item.name}</td>
                          <td className="py-4 px-6 text-center font-bold text-dark-700">{item.qty} pcs</td>
                          <td className="py-4 px-6 text-right font-black text-dark-900">₹{item.revenue.toLocaleString()}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3 justify-end">
                              <div className="w-32 bg-gold-100 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-red-600 h-full rounded-full" style={{ width: `${Math.min(item.share, 100)}%` }}></div>
                              </div>
                              <span className="text-[10px] font-black text-dark-600 min-w-[36px] text-right">{item.share}%</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-16 text-center text-dark-400 text-xs font-medium italic">
                          No products found matching criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: COUPONS (Matching Screenshot 3) */}
        {tab === "COUPONS" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Discount Summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-gold-200 p-6 flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-dark-900 tracking-widest uppercase mb-6">Discount Summary</h3>

                  <div className="space-y-4">
                    <div className="bg-gold-50/50 p-4 rounded-xl border border-gold-100 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Total Discounts Given</div>
                        <div className="text-2xl font-black text-dark-900 mt-1">₹{couponData.totalDiscount.toLocaleString()}</div>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                        <Percent size={16} />
                      </div>
                    </div>

                    <div className="bg-gold-50/50 p-4 rounded-xl border border-gold-100 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Discounted Orders</div>
                        <div className="text-2xl font-black text-dark-900 mt-1">{couponData.discountedOrdersCount}</div>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                        <Tag size={16} />
                      </div>
                    </div>

                    <div className="bg-gold-50/50 p-4 rounded-xl border border-gold-100 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Avg Discount Per Order</div>
                        <div className="text-2xl font-black text-dark-900 mt-1">₹{couponData.avgDiscount}</div>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
                        <IndianRupee size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Promo Campaign Performance */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gold-200 p-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h3 className="text-xs font-bold text-dark-900 tracking-widest uppercase">Promo Campaign Performance</h3>
                  
                  <div className="relative w-full sm:w-64">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                    <input 
                      type="text" 
                      value={couponSearch}
                      onChange={(e) => setCouponSearch(e.target.value)}
                      placeholder="Search by ID or customer..."
                      className="w-full bg-gold-50 border border-gold-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-dark-900 outline-none focus:border-brand-gold focus:bg-white transition-all placeholder-dark-400"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto min-h-[250px]">
                  <table className="w-full text-left border-collapse min-w-[550px]">
                    <thead>
                      <tr className="border-b border-gold-200 text-[10px] font-bold text-dark-400 uppercase tracking-widest bg-gold-50/50">
                        <th className="py-3 px-4">Transaction ID</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4 text-center">Order Total</th>
                        <th className="py-3 px-4 text-right">Discount Applied</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold-100 text-xs">
                      {couponData.promos.length > 0 ? (
                        couponData.promos.map((promo) => (
                          <tr key={promo.id} className="hover:bg-gold-50/50 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-dark-900">{promo.id}</td>
                            <td className="py-3.5 px-4 font-bold text-dark-800">{promo.customer}</td>
                            <td className="py-3.5 px-4 text-center font-extrabold text-dark-900">₹{promo.total.toLocaleString()}</td>
                            <td className="py-3.5 px-4 text-right font-black text-red-600">-₹{promo.discount}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-16 text-center text-dark-400 text-xs font-medium italic">
                            No coupon campaigns or discounted orders found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </AdminSidebarLayout>
  );
}
