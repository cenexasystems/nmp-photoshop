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
  Search,
  Building2,
  Banknote,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
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
  branchId?: string;
  amountPaid?: number;
}

export interface Expense {
  id: string;
  branch_id: string;
  date: string;
  category: string;
  amount: number;
  payment_mode: string;
  notes?: string;
}

export interface PaymentLog {
  id: string;
  order_id: string;
  amount: number;
  payment_mode: string;
  recorded_at: string;
}

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

function getMonthString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<PaymentLog[]>([]);
  const [period, setPeriod] = useState("This Month");
  const [tab, setTab] = useState("BRANCH ANALYTICS");
  const [selectedBranch, setSelectedBranch] = useState<string>("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  
  // Search States for tabs
  const [todaySearch, setTodaySearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [couponSearch, setCouponSearch] = useState("");

  const currentWeekNum = useMemo(() => getISOWeekNumber(new Date()), []);
  const todayStr = useMemo(() => getTodayString(), []);
  const currentMonthPrefix = useMemo(() => getMonthString(), []);

  const loadData = async () => {
    // 1. Fetch Orders
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('date', { ascending: false });

    if (orderData && !orderError) {
      const mappedOrders: Order[] = orderData.map((o: any) => ({
        id: o.id,
        customer: o.customer_name || 'Walk-in',
        phone: o.customer_phone || '',
        source: o.source,
        total: o.total,
        status: o.payment_status || 'Unpaid',
        product: o.order_items?.map((i: any) => i.product).join(', ') || '',
        date: o.date,
        paymentMode: o.payment_mode || 'Cash',
        deliveryStatus: o.delivery_status || 'Pending',
        details: o.order_items?.map((i: any) => i.details).join(', ') || '',
        idNumber: o.order_items?.[0]?.id_number || '',
        discount: o.discount || 0,
        branchId: o.branch_id || 'chennai-main',
        amountPaid: o.amount_paid || 0
      }));
      setOrders(mappedOrders);
    }

    // 2. Fetch Expenses
    const { data: expData } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

    if (expData) {
      setExpenses(expData);
    }

    // 3. Fetch Payments History
    const { data: payData } = await supabase
      .from('payments')
      .select('*')
      .order('recorded_at', { ascending: false });

    if (payData) {
      setPayments(payData);
    }
  };

  useEffect(() => {
    loadData();
    handlePeriodChange("This Month");
  }, []);

  const handlePeriodChange = (p: string) => {
    setPeriod(p);
    if (p === "Today") {
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

  // Branch list dynamically compiled
  const branchesList = useMemo(() => {
    const set = new Set<string>();
    orders.forEach(o => { if (o.branchId) set.add(o.branchId); });
    expenses.forEach(e => { if (e.branch_id) set.add(e.branch_id); });
    // Default fallback branches
    set.add("chennai-main");
    set.add("bangalore-hub");
    set.add("mumbai-central");
    return Array.from(set);
  }, [orders, expenses]);

  // Branch Filtered Orders & Expenses
  const branchOrders = useMemo(() => {
    if (selectedBranch === "ALL") return orders;
    return orders.filter(o => o.branchId === selectedBranch);
  }, [orders, selectedBranch]);

  const branchExpenses = useMemo(() => {
    if (selectedBranch === "ALL") return expenses;
    return expenses.filter(e => e.branch_id === selectedBranch);
  }, [expenses, selectedBranch]);

  // Filter orders by date range
  const dateFilteredOrders = useMemo(() => {
    return branchOrders.filter(o => {
      if (fromDate && o.date < fromDate) return false;
      if (toDate && o.date > toDate) return false;
      return true;
    });
  }, [branchOrders, fromDate, toDate]);

  const dateFilteredExpenses = useMemo(() => {
    return branchExpenses.filter(e => {
      if (fromDate && e.date < fromDate) return false;
      if (toDate && e.date > toDate) return false;
      return true;
    });
  }, [branchExpenses, fromDate, toDate]);

  // -------------------------------------------------------------
  // DAILY & MONTHLY CASH VS GPAY FINANCIAL CALCULATIONS
  // -------------------------------------------------------------

  // TODAY'S CALCULATIONS
  const todayOrders = useMemo(() => {
    return branchOrders.filter(o => o.date === todayStr);
  }, [branchOrders, todayStr]);

  const todayCompletedOrders = useMemo(() => {
    return todayOrders.filter(o => o.status === "Paid" || (o.amountPaid || 0) > 0);
  }, [todayOrders]);

  const todayExpensesList = useMemo(() => {
    return branchExpenses.filter(e => e.date === todayStr);
  }, [branchExpenses, todayStr]);

  // Daily Cash Sales vs GPay Sales
  const todayCashSales = useMemo(() => {
    return todayCompletedOrders.reduce((sum, o) => {
      if ((o.paymentMode || "").toLowerCase().includes("cash")) {
        return sum + (o.amountPaid || o.total);
      }
      return sum;
    }, 0);
  }, [todayCompletedOrders]);

  const todayGPaySales = useMemo(() => {
    return todayCompletedOrders.reduce((sum, o) => {
      const mode = (o.paymentMode || "").toLowerCase();
      if (mode.includes("gpay") || mode.includes("card") || mode.includes("upi") || mode.includes("online") || mode.includes("phonepe") || mode.includes("mixed")) {
        return sum + (o.amountPaid || o.total);
      }
      return sum;
    }, 0);
  }, [todayCompletedOrders]);

  // Daily Expenses (Cash vs GPay)
  const todayExpenseCash = useMemo(() => {
    return todayExpensesList
      .filter(e => (e.payment_mode || "").toLowerCase().includes("cash"))
      .reduce((sum, e) => sum + Number(e.amount), 0);
  }, [todayExpensesList]);

  const todayExpenseGPay = useMemo(() => {
    return todayExpensesList
      .filter(e => !(e.payment_mode || "").toLowerCase().includes("cash"))
      .reduce((sum, e) => sum + Number(e.amount), 0);
  }, [todayExpensesList]);


  // MONTHLY CALCULATIONS (Current Month)
  const monthlyOrders = useMemo(() => {
    return branchOrders.filter(o => (o.date || "").startsWith(currentMonthPrefix));
  }, [branchOrders, currentMonthPrefix]);

  const monthlyCompletedOrders = useMemo(() => {
    return monthlyOrders.filter(o => o.status === "Paid" || (o.amountPaid || 0) > 0);
  }, [monthlyOrders]);

  const monthlyExpensesList = useMemo(() => {
    return branchExpenses.filter(e => (e.date || "").startsWith(currentMonthPrefix));
  }, [branchExpenses, currentMonthPrefix]);

  // Monthly Cash Sales vs GPay Sales
  const monthCashSales = useMemo(() => {
    return monthlyCompletedOrders.reduce((sum, o) => {
      if ((o.paymentMode || "").toLowerCase().includes("cash")) {
        return sum + (o.amountPaid || o.total);
      }
      return sum;
    }, 0);
  }, [monthlyCompletedOrders]);

  const monthGPaySales = useMemo(() => {
    return monthlyCompletedOrders.reduce((sum, o) => {
      const mode = (o.paymentMode || "").toLowerCase();
      if (mode.includes("gpay") || mode.includes("card") || mode.includes("upi") || mode.includes("online") || mode.includes("phonepe") || mode.includes("mixed")) {
        return sum + (o.amountPaid || o.total);
      }
      return sum;
    }, 0);
  }, [monthlyCompletedOrders]);

  // Monthly Expenses (Cash vs GPay)
  const monthExpenseCash = useMemo(() => {
    return monthlyExpensesList
      .filter(e => (e.payment_mode || "").toLowerCase().includes("cash"))
      .reduce((sum, e) => sum + Number(e.amount), 0);
  }, [monthlyExpensesList]);

  const monthExpenseGPay = useMemo(() => {
    return monthlyExpensesList
      .filter(e => !(e.payment_mode || "").toLowerCase().includes("cash"))
      .reduce((sum, e) => sum + Number(e.amount), 0);
  }, [monthlyExpensesList]);


  // -------------------------------------------------------------
  // BRANCH-WISE COMPARISON MATRIX
  // -------------------------------------------------------------
  const branchAnalyticsMatrix = useMemo(() => {
    return branchesList.map(bId => {
      const bOrders = orders.filter(o => o.branchId === bId);
      const bExpenses = expenses.filter(e => e.branch_id === bId);
      const bCompleted = bOrders.filter(o => o.status === "Paid" || (o.amountPaid || 0) > 0);

      const bTotalRevenue = bCompleted.reduce((acc, o) => acc + (o.amountPaid || o.total), 0);
      const bCashSales = bCompleted.filter(o => (o.paymentMode || "").toLowerCase().includes("cash")).reduce((acc, o) => acc + (o.amountPaid || o.total), 0);
      const bGPaySales = bCompleted.filter(o => !(o.paymentMode || "").toLowerCase().includes("cash")).reduce((acc, o) => acc + (o.amountPaid || o.total), 0);

      const bTotalExpenses = bExpenses.reduce((acc, e) => acc + Number(e.amount), 0);
      const bCashExpenses = bExpenses.filter(e => (e.payment_mode || "").toLowerCase().includes("cash")).reduce((acc, e) => acc + Number(e.amount), 0);
      const bGPayExpenses = bExpenses.filter(e => !(e.payment_mode || "").toLowerCase().includes("cash")).reduce((acc, e) => acc + Number(e.amount), 0);

      const netMargin = bTotalRevenue - bTotalExpenses;

      return {
        branchId: bId,
        branchName: bId.replace('-', ' ').toUpperCase(),
        totalOrders: bOrders.length,
        completedBills: bCompleted.length,
        totalRevenue: bTotalRevenue,
        cashSales: bCashSales,
        gpaySales: bGPaySales,
        totalExpenses: bTotalExpenses,
        cashExpenses: bCashExpenses,
        gpayExpenses: bGPayExpenses,
        netMargin
      };
    });
  }, [branchesList, orders, expenses]);


  // Calculations for Today's Sales Tab
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

  const todayCompleted = todayCompletedOrders;
  const todayRevenue = useMemo(() => todayCompleted.reduce((acc, o) => acc + (o.amountPaid || o.total), 0), [todayCompleted]);
  const todayBills = todayCompleted.length;
  const todayAvgOrderValue = todayBills > 0 ? Math.round(todayRevenue / todayBills) : 0;
  const todayOfflineRev = todayCompleted.filter(o => o.source === "OFFLINE").reduce((a, b) => a + (b.amountPaid || b.total), 0);
  const todayOnlineRev = todayCompleted.filter(o => o.source === "ONLINE").reduce((a, b) => a + (b.amountPaid || b.total), 0);

  // Calculations for Revenue Tab
  const completedOrders = useMemo(() => dateFilteredOrders.filter(o => o.status === "Paid" || (o.amountPaid || 0) > 0), [dateFilteredOrders]);
  const totalRevenue = useMemo(() => completedOrders.reduce((a, b) => a + (b.amountPaid || b.total), 0), [completedOrders]);
  const offlineBillsRev = useMemo(() => completedOrders.filter(o => o.source === "OFFLINE").reduce((a, b) => a + (b.amountPaid || b.total), 0), [completedOrders]);
  const onlineBillsRev = useMemo(() => completedOrders.filter(o => o.source === "ONLINE").reduce((a, b) => a + (b.amountPaid || b.total), 0), [completedOrders]);
  const totalOfflineCount = useMemo(() => completedOrders.filter(o => o.source === "OFFLINE").length, [completedOrders]);
  const totalOnlineCount = useMemo(() => completedOrders.filter(o => o.source === "ONLINE").length, [completedOrders]);
  
  const totalItemsSold = useMemo(() => {
    return completedOrders.reduce((acc, o) => {
      const match = o.details?.match(/(\d+)\s*pcs/i) || o.details?.match(/(\d+)\s*Copies/i);
      return acc + (match ? parseInt(match[1], 10) : 1);
    }, 0);
  }, [completedOrders]);

  const avgOrderVal = completedOrders.length > 0 ? Math.round((totalRevenue / completedOrders.length) * 100) / 100 : 0;

  const totalOrdersCount = totalOfflineCount + totalOnlineCount || 1;
  const offlinePct = Math.round((totalOfflineCount / totalOrdersCount) * 100);
  const onlinePct = Math.round((totalOnlineCount / totalOrdersCount) * 100);

  // Dynamic Top Items calculation
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
              POS Analytics & Financial Suite
            </h2>
            <p className="text-xs text-dark-500 mt-1 pl-3.5 font-medium">
              Branch-wise sales breakdown, Cash vs GPay daily/monthly collections & expense analytics
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <button 
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-1.5 bg-white hover:bg-gold-50 text-dark-900 border border-gold-200 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm cursor-pointer"
            >
              <RotateCw size={12} className="text-brand-gold" />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Branch Filter Selector & Date Period Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white/80 p-3.5 rounded-2xl border border-gold-200 shadow-sm">
          
          {/* Branch Filter Selector */}
          <div className="flex items-center gap-2">
            <Building2 className="text-brand-gold" size={16} />
            <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest hidden sm:inline">Branch:</span>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-gold-50 border border-gold-200 rounded-full px-4 py-1.5 text-xs font-extrabold text-dark-900 uppercase tracking-wider outline-none cursor-pointer focus:border-brand-gold"
            >
              <option value="ALL">All Branches</option>
              {branchesList.map(b => (
                <option key={b} value={b}>
                  {b.replace('-', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Period Pills */}
          {tab !== "TODAY'S SALES" ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest px-1">Period:</span>
              {["Today", "This Week", "This Month", "This Year", "Custom"].map(p => (
                <button 
                  key={p}
                  onClick={() => handlePeriodChange(p)}
                  className={cn(
                    "px-3.5 py-1 rounded-full text-[11px] font-bold transition-all uppercase tracking-wider cursor-pointer",
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
              Today's Live Financials
            </div>
          )}

          {/* Date Pickers */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2 bg-white border border-gold-200 rounded-xl sm:rounded-full px-3 py-2 sm:px-4 sm:py-1.5 shadow-sm w-full sm:w-auto">
            <div className="flex items-center gap-2 flex-1 min-w-[120px]">
              <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">From</span>
              <input 
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPeriod("Custom");
                }}
                className="w-full text-xs font-bold text-dark-900 bg-transparent outline-none cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-[120px]">
              <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest ml-1 sm:ml-1">To</span>
              <input 
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPeriod("Custom");
                }}
                className="w-full text-xs font-bold text-dark-900 bg-transparent outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>



        {/* Analytics Main Tabs */}
        <div className="flex items-center gap-6 sm:gap-8 border-b border-gold-200 overflow-x-auto flex-nowrap">
          {["BRANCH ANALYTICS", "REVENUE", "TODAY'S SALES", "PRODUCTS", "COUPONS"].map(t => (
            <button 
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "py-3 text-[11px] font-bold uppercase tracking-widest border-b-2 transition-all cursor-pointer whitespace-nowrap",
                tab === t 
                  ? "border-dark-900 text-dark-900 font-extrabold scale-105" 
                  : "border-transparent text-dark-400 hover:text-dark-700"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* TAB 0: BRANCH ANALYTICS (Branch-wise Breakdown Requested by Client) */}
        {tab === "BRANCH ANALYTICS" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Branch Summary Cards */}
            <div className="bg-white rounded-2xl shadow-sm border border-gold-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xs font-black text-dark-900 tracking-widest uppercase flex items-center gap-2">
                    <Building2 className="text-brand-gold" size={16} />
                    Branch-wise Performance & Collections
                  </h3>
                  <p className="text-[11px] text-dark-500 font-medium mt-0.5">Comparative overview across all studio branches</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {branchAnalyticsMatrix.map(b => (
                  <div key={b.branchId} className="bg-gold-50/50 p-5 rounded-2xl border border-gold-200 hover:border-brand-gold transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-black text-dark-900 tracking-wider">{b.branchName}</span>
                      <span className="text-[9px] font-extrabold bg-dark-900 text-white px-2 py-0.5 rounded-full uppercase">
                        {b.completedBills} Bills
                      </span>
                    </div>

                    <div className="text-xl font-black text-dark-900 mb-3">₹{b.totalRevenue.toLocaleString()}</div>
                    
                    <div className="space-y-1.5 text-xs pt-3 border-t border-gold-200">
                      <div className="flex justify-between">
                        <span className="text-dark-500 font-medium">Cash Collected:</span>
                        <span className="font-bold text-emerald-700">₹{b.cashSales.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-500 font-medium">GPay / Online:</span>
                        <span className="font-bold text-blue-700">₹{b.gpaySales.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-500 font-medium">Expenses:</span>
                        <span className="font-bold text-red-600">-₹{b.totalExpenses.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-gold-200 font-extrabold">
                        <span className="text-dark-900">Net Balance:</span>
                        <span className={b.netMargin >= 0 ? "text-emerald-700 font-black" : "text-red-600 font-black"}>
                          ₹{b.netMargin.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Branch Matrix Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-gold-200 text-[10px] font-bold text-dark-400 uppercase tracking-widest bg-gold-50/50">
                      <th className="py-3.5 px-4">Branch</th>
                      <th className="py-3.5 px-4 text-center">Orders</th>
                      <th className="py-3.5 px-4 text-right">Sales Revenue</th>
                      <th className="py-3.5 px-4 text-right">Cash Sales</th>
                      <th className="py-3.5 px-4 text-right">GPay Sales</th>
                      <th className="py-3.5 px-4 text-right">Expenses</th>
                      <th className="py-3.5 px-4 text-right font-black">Net Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-100 text-xs font-semibold">
                    {branchAnalyticsMatrix.map(b => (
                      <tr key={b.branchId} className="hover:bg-gold-50/40 transition-colors">
                        <td className="py-4 px-4 font-black text-dark-900 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-brand-gold"></span>
                          {b.branchName}
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-dark-700">{b.completedBills}</td>
                        <td className="py-4 px-4 text-right font-black text-dark-900">₹{b.totalRevenue.toLocaleString()}</td>
                        <td className="py-4 px-4 text-right font-bold text-emerald-700">₹{b.cashSales.toLocaleString()}</td>
                        <td className="py-4 px-4 text-right font-bold text-blue-700">₹{b.gpaySales.toLocaleString()}</td>
                        <td className="py-4 px-4 text-right font-bold text-red-600">-₹{b.totalExpenses.toLocaleString()}</td>
                        <td className="py-4 px-4 text-right font-black text-dark-900">
                          <span className={b.netMargin >= 0 ? "text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md" : "text-red-600 bg-red-50 px-2 py-1 rounded-md"}>
                            ₹{b.netMargin.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        )}

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
            </div>

            {/* MONTHLY FINANCIAL BLOCKS */}
            <div className="bg-white rounded-2xl shadow-sm border border-gold-200 p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gold-100">
                <h3 className="text-xs font-black text-dark-900 uppercase tracking-widest flex items-center gap-2">
                  <CreditCard className="text-brand-gold" size={16} />
                  Monthly Financial Blocks ({currentMonthPrefix})
                </h3>
                <span className="text-[9px] font-extrabold bg-gold-100 text-dark-900 px-2 py-0.5 rounded-full uppercase">
                  Current Month
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                {/* Block 5: Cash per month */}
                <div className="bg-white p-4 rounded-xl border border-teal-300 shadow-sm flex flex-col justify-between bg-teal-50/30">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-teal-800 uppercase tracking-wider">Cash per Month</span>
                    <span className="text-[9px] sm:text-[10px] font-bold bg-teal-100 text-teal-900 px-2 py-0.5 rounded-md whitespace-nowrap">Month Cash</span>
                  </div>
                  <div className="text-xl font-black text-teal-950">₹{monthCashSales.toLocaleString()}</div>
                </div>

                {/* Block 6: GPay per month */}
                <div className="bg-white p-4 rounded-xl border border-indigo-300 shadow-sm flex flex-col justify-between bg-indigo-50/30">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-indigo-800 uppercase tracking-wider">GPay per Month</span>
                    <span className="text-[9px] sm:text-[10px] font-bold bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded-md whitespace-nowrap">Month GPay</span>
                  </div>
                  <div className="text-xl font-black text-indigo-950">₹{monthGPaySales.toLocaleString()}</div>
                </div>

                {/* Block 7: Expense Cash per month */}
                <div className="bg-white p-4 rounded-xl border border-rose-300 shadow-sm flex flex-col justify-between bg-rose-50/30">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-rose-800 uppercase tracking-wider">Expense Cash Month</span>
                    <span className="text-[9px] sm:text-[10px] font-bold bg-rose-100 text-rose-900 px-2 py-0.5 rounded-md whitespace-nowrap">Month Exp</span>
                  </div>
                  <div className="text-xl font-black text-rose-950">-₹{monthExpenseCash.toLocaleString()}</div>
                </div>

                {/* Block 8: Expense GPay per month */}
                <div className="bg-white p-4 rounded-xl border border-orange-300 shadow-sm flex flex-col justify-between bg-orange-50/30">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-orange-900 uppercase tracking-wider">Expense GPay Month</span>
                    <span className="text-[9px] sm:text-[10px] font-bold bg-orange-100 text-orange-950 px-2 py-0.5 rounded-md whitespace-nowrap">GPay Exp</span>
                  </div>
                  <div className="text-xl font-black text-orange-950">-₹{monthExpenseGPay.toLocaleString()}</div>
                </div>
              </div>
            </div>


            {/* Charts & Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Side 2/3: Revenue Trend & Revenue This Week */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Revenue Trend This Year Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gold-200 p-6">
                  <div className="mb-6">
                    <h3 className="text-xs font-black text-red-900 tracking-widest uppercase flex items-center gap-1">
                      REVENUE TREND THIS YEAR <span className="text-red-700">2026</span>
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-2xl font-black text-dark-900">₹{totalRevenue.toLocaleString()}</span>
                      <span className="text-[9px] font-bold bg-orange-50 text-orange-600 border border-orange-200 rounded-md px-2 py-0.5 uppercase tracking-widest">
                        Avg ₹{Math.round(totalRevenue / 12).toLocaleString()}/mo
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto pb-2">
                    <div className="h-56 flex items-end justify-between gap-2 px-2 pb-2 min-w-[500px]">
                    {["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"].map((m) => {
                      const isAugust = m === "AUG";
                      const monthRevenue = isAugust ? `₹${totalRevenue.toLocaleString()}` : "₹0.00";
                      return (
                        <div key={m} className="flex flex-col items-center gap-3 flex-1 h-full justify-end group/bar relative">
                          <div className="absolute -top-10 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-dark-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md pointer-events-none z-20 whitespace-nowrap">
                            {m}: {monthRevenue}
                          </div>
                          {isAugust ? (
                            <div className="flex flex-col items-center w-full max-w-[36px]" title={`AUG: ${monthRevenue}`}>
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
                </div>

                {/* Revenue This Week Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gold-200 p-6">
                  <div className="mb-4">
                    <h3 className="text-xs font-black text-dark-900 tracking-widest uppercase flex items-center gap-1.5">
                      REVENUE THIS WEEK 
                      <span className="text-red-700 font-extrabold">(WEEK {currentWeekNum} OF 2026)</span>
                    </h3>
                    <div className="text-xs font-bold text-dark-500 mt-1">₹{totalRevenue.toLocaleString()} total</div>
                  </div>

                  <div className="h-32 flex items-end justify-between gap-3 px-2 pb-2">
                    {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => {
                      const isThu = day === "THU";
                      const dayRevenue = isThu ? `₹${totalRevenue.toLocaleString()}` : "₹0.00";
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


              </div>

            </div>

          </div>
        )}

        {/* TAB 2: TODAY'S SALES */}
        {tab === "TODAY'S SALES" && (
          <div className="space-y-6 animate-in fade-in duration-300">

            {/* DAILY FINANCIAL BLOCKS */}
            <div className="bg-white rounded-2xl shadow-sm border border-gold-200 p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gold-100">
                <h3 className="text-xs font-black text-dark-900 uppercase tracking-widest flex items-center gap-2">
                  <Banknote className="text-emerald-600" size={16} />
                  Daily Financial Blocks (Today)
                </h3>
                <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase">
                  Real-time Today
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                {/* Block 1: Cash per day */}
                <div className="bg-white p-4 rounded-xl border border-emerald-300 shadow-sm flex flex-col justify-between bg-emerald-50/30">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">Cash per Day</span>
                    <span className="text-[9px] sm:text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md whitespace-nowrap">Sales</span>
                  </div>
                  <div className="text-xl font-black text-emerald-950">₹{todayCashSales.toLocaleString()}</div>
                </div>

                {/* Block 2: GPay per day */}
                <div className="bg-white p-4 rounded-xl border border-blue-300 shadow-sm flex flex-col justify-between bg-blue-50/30">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-blue-800 uppercase tracking-wider">GPay per Day</span>
                    <span className="text-[9px] sm:text-[10px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md whitespace-nowrap">Online</span>
                  </div>
                  <div className="text-xl font-black text-blue-950">₹{todayGPaySales.toLocaleString()}</div>
                </div>

                {/* Block 3: Expense Cash per day */}
                <div className="bg-white p-4 rounded-xl border border-red-300 shadow-sm flex flex-col justify-between bg-red-50/30">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-red-800 uppercase tracking-wider">Expense Cash Day</span>
                    <span className="text-[9px] sm:text-[10px] font-bold bg-red-100 text-red-900 px-2 py-0.5 rounded-md whitespace-nowrap">Payout</span>
                  </div>
                  <div className="text-xl font-black text-red-950">-₹{todayExpenseCash.toLocaleString()}</div>
                </div>

                {/* Block 4: Expense GPay per day */}
                <div className="bg-white p-4 rounded-xl border border-amber-300 shadow-sm flex flex-col justify-between bg-amber-50/30">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider">Expense GPay Day</span>
                    <span className="text-[9px] sm:text-[10px] font-bold bg-amber-100 text-amber-950 px-2 py-0.5 rounded-md whitespace-nowrap">Online Exp</span>
                  </div>
                  <div className="text-xl font-black text-amber-950">-₹{todayExpenseGPay.toLocaleString()}</div>
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
                
                {/* Channel Split & Total Revenue Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gold-200 p-6 flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row gap-5 items-start justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-dark-900 tracking-widest uppercase mb-2">Total Revenue</h3>
                      <div className="text-3xl font-black text-dark-900">₹{todayRevenue.toLocaleString()}</div>
                      <div className="text-[10px] font-bold text-dark-400 mt-1 uppercase tracking-widest">Completed today</div>
                    </div>

                    <div className="flex flex-col gap-2.5 pt-1 w-full sm:w-auto">
                      <div className="flex items-center gap-2 text-[11px] font-extrabold text-dark-700 tracking-wide">
                        <span>Net Cash Profit</span>
                        <span className="text-dark-300 font-medium">=</span>
                        <span className="text-emerald-700">₹{(todayCashSales - todayExpenseCash).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-extrabold text-dark-700 tracking-wide">
                        <span>Net GPay Profit</span>
                        <span className="text-dark-300 font-medium">=</span>
                        <span className="text-blue-700">₹{(todayGPaySales - todayExpenseGPay).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gold-100 pt-5">
                    <h3 className="text-xs font-bold text-dark-900 tracking-widest uppercase mb-4">Today's Channel Split</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1 text-xs font-extrabold">
                          <span className="text-red-500 uppercase tracking-widest text-[10px]">Offline</span>
                          <span className="text-dark-900">₹{todayOfflineRev.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 w-full bg-gold-50 rounded-full overflow-hidden border border-gold-100">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: todayRevenue > 0 ? `${(todayOfflineRev / todayRevenue) * 100}%` : '0%' }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1 text-xs font-extrabold">
                          <span className="text-emerald-500 uppercase tracking-widest text-[10px]">Online</span>
                          <span className="text-dark-900">₹{todayOnlineRev.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 w-full bg-gold-50 rounded-full overflow-hidden border border-gold-100">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: todayRevenue > 0 ? `${(todayOnlineRev / todayRevenue) * 100}%` : '0%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>


              </div>

            </div>

          </div>
        )}

        {/* TAB 3: PRODUCTS */}
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

        {/* TAB 4: COUPONS */}
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
                  </div>
                </div>
              </div>

              {/* Right Column: Discount Applied */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gold-200 p-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h3 className="text-xs font-bold text-dark-900 tracking-widest uppercase">Discount Applied</h3>
                  
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
