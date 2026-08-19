"use client";

import { SidebarLayout } from "@/components/SidebarLayout";
import { 
  TrendingUp, 
  ShoppingBag, 
  Wallet, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Banknote, 
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Calendar,
  Users
} from "lucide-react";
import { useState, useEffect, useMemo, use } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function BranchDashboardPage({ params }: { params: Promise<{ branch: string }> }) {
  const { branch } = use(params);
  const [orders, setOrders] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const branchName = useMemo(() => branch.replace(/-/g, ' ').toUpperCase(), [branch]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      // Fetch branch orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('branch_id', branch)
        .order('created_at', { ascending: false });

      // Fetch branch expenses
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*')
        .eq('branch_id', branch)
        .order('date', { ascending: false });

      if (ordersData) setOrders(ordersData);
      if (expensesData) setExpenses(expensesData);
      setLoading(false);
    }
    loadData();
  }, [branch]);

  // Calculations for Today
  const todayOrders = useMemo(() => {
    return orders.filter(o => o.date === todayStr);
  }, [orders, todayStr]);

  const todayExpenses = useMemo(() => {
    return expenses.filter(e => e.date === todayStr);
  }, [expenses, todayStr]);

  const todayPaidOrders = useMemo(() => {
    return todayOrders.filter(o => o.payment_status === "Paid" || (o.amount_paid || 0) > 0);
  }, [todayOrders]);

  const todayRevenue = useMemo(() => {
    return todayPaidOrders.reduce((sum, o) => sum + (Number(o.amount_paid) || Number(o.total) || 0), 0);
  }, [todayPaidOrders]);

  const todayCashSales = useMemo(() => {
    return todayPaidOrders.reduce((sum, o) => {
      if ((o.payment_mode || "").toLowerCase().includes("cash")) {
        return sum + (Number(o.amount_paid) || Number(o.total) || 0);
      }
      return sum;
    }, 0);
  }, [todayPaidOrders]);

  const todayGPaySales = useMemo(() => {
    return todayPaidOrders.reduce((sum, o) => {
      const mode = (o.payment_mode || "").toLowerCase();
      if (mode.includes("gpay") || mode.includes("card") || mode.includes("upi") || mode.includes("online") || mode.includes("phonepe")) {
        return sum + (Number(o.amount_paid) || Number(o.total) || 0);
      }
      return sum;
    }, 0);
  }, [todayPaidOrders]);

  const todayExpenseCash = useMemo(() => {
    return todayExpenses
      .filter(e => (e.payment_mode || "").toLowerCase().includes("cash"))
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [todayExpenses]);

  const todayExpenseGPay = useMemo(() => {
    return todayExpenses
      .filter(e => !(e.payment_mode || "").toLowerCase().includes("cash"))
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [todayExpenses]);

  const todayTotalExpenses = todayExpenseCash + todayExpenseGPay;
  const todayNetCash = todayCashSales - todayExpenseCash;
  const todayNetGPay = todayGPaySales - todayExpenseGPay;

  // Pending amount — all orders with outstanding balance
  const pendingAmount = useMemo(() => {
    return orders.reduce((sum, o) => {
      const paid = Number(o.amount_paid) || (o.payment_status === "Paid" ? Number(o.total) : 0);
      const due = Math.max(0, Number(o.total) - paid);
      return sum + due;
    }, 0);
  }, [orders]);

  const pendingBillsCount = useMemo(() => {
    return orders.filter(o => {
      const paid = Number(o.amount_paid) || (o.payment_status === "Paid" ? Number(o.total) : 0);
      return Number(o.total) > paid;
    }).length;
  }, [orders]);

  // Status counters
  const pendingCount = useMemo(() => orders.filter(o => (o.delivery_status || "Pending") === "Pending").length, [orders]);
  const processingCount = useMemo(() => orders.filter(o => o.delivery_status === "Processing").length, [orders]);
  const readyCount = useMemo(() => orders.filter(o => o.delivery_status === "Ready").length, [orders]);

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  return (
    <SidebarLayout>
      <div className="flex flex-col gap-6 pb-10">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-6 bg-gray-900 rounded-full inline-block"></span>
              <h2 className="text-xl sm:text-2xl font-black text-dark-900 tracking-tight">
                {branchName} DASHBOARD
              </h2>
            </div>
            <p className="text-xs text-dark-500 font-medium mt-1 pl-4">
              Real-time branch metrics, daily collection overview & order pipeline.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {todayStr}
            </span>
            <Link
              href={`/${branch}`}
              className="px-4 py-2 bg-dark-900 hover:bg-dark-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
            >
              + New Sale
            </Link>
          </div>
        </div>

        {/* Top KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Today's Revenue */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-extrabold text-dark-400 uppercase tracking-widest">Today's Revenue</span>
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                ₹
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-dark-900">₹{todayRevenue.toLocaleString()}</div>
              <div className="text-[10px] font-bold text-dark-400 mt-1 uppercase tracking-wider">
                {todayPaidOrders.length} payments collected today
              </div>
            </div>
          </div>

          {/* Net Cash Profit */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest">Net Cash Profit</span>
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Banknote size={16} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-950">₹{todayNetCash.toLocaleString()}</div>
              <div className="text-[10px] font-bold text-dark-400 mt-1 uppercase tracking-wider">
                Cash In: ₹{todayCashSales.toLocaleString()} | Exp: -₹{todayExpenseCash.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Net GPay Profit */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-widest">Net GPay Profit</span>
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                UPI
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-blue-950">₹{todayNetGPay.toLocaleString()}</div>
              <div className="text-[10px] font-bold text-dark-400 mt-1 uppercase tracking-wider">
                GPay In: ₹{todayGPaySales.toLocaleString()} | Exp: -₹{todayExpenseGPay.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Today's Expenses */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-extrabold text-red-600 uppercase tracking-widest">Today's Expenses</span>
              <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                <Wallet size={16} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-red-600">₹{todayTotalExpenses.toLocaleString()}</div>
              <div className="text-[10px] font-bold text-dark-400 mt-1 uppercase tracking-wider">
                {todayExpenses.length} expense item(s) logged
              </div>
            </div>
          </div>

          {/* Pending Amount */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-amber-200 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-widest">Pending Amount</span>
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
                <AlertCircle size={16} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-amber-700">₹{pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="text-[10px] font-bold text-dark-400 mt-1 uppercase tracking-wider">
                {pendingBillsCount} unpaid / partial bill{pendingBillsCount !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

        </div>

        {/* Order Status Pipeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href={`/${branch}/history`}
            className="bg-white p-5 rounded-2xl shadow-sm border border-amber-200 hover:border-amber-400 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Clock size={20} />
              </div>
              <div>
                <div className="text-[10px] font-extrabold text-amber-800 uppercase tracking-widest">Pending Orders</div>
                <div className="text-xl font-black text-dark-900">{pendingCount}</div>
              </div>
            </div>
            <ArrowUpRight size={18} className="text-dark-400 group-hover:text-amber-600 transition-colors" />
          </Link>

          <Link 
            href={`/${branch}/history`}
            className="bg-white p-5 rounded-2xl shadow-sm border border-blue-200 hover:border-blue-400 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <ShoppingBag size={20} />
              </div>
              <div>
                <div className="text-[10px] font-extrabold text-blue-800 uppercase tracking-widest">Processing</div>
                <div className="text-xl font-black text-dark-900">{processingCount}</div>
              </div>
            </div>
            <ArrowUpRight size={18} className="text-dark-400 group-hover:text-blue-600 transition-colors" />
          </Link>

          <Link 
            href={`/${branch}/history`}
            className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-200 hover:border-emerald-400 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest">Ready for Pickup</div>
                <div className="text-xl font-black text-dark-900">{readyCount}</div>
              </div>
            </div>
            <ArrowUpRight size={18} className="text-dark-400 group-hover:text-emerald-600 transition-colors" />
          </Link>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recent Orders List (2 Columns) */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
                <h3 className="text-xs font-black text-dark-900 uppercase tracking-widest flex items-center gap-2">
                  <FileText size={16} className="text-gray-700" />
                  Recent Branch Orders
                </h3>
                <Link href={`/${branch}/history`} className="text-[10px] font-extrabold text-gray-700 hover:underline uppercase tracking-wider">
                  View All Orders →
                </Link>
              </div>

              {loading ? (
                <div className="py-12 text-center text-xs font-semibold text-dark-400">Loading branch orders...</div>
              ) : recentOrders.length === 0 ? (
                <div className="py-12 text-center text-xs font-medium italic text-dark-400">No orders logged for this branch yet.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentOrders.map((ord) => (
                    <div key={ord.id} className="py-3.5 flex items-center justify-between hover:bg-gray-50 px-2 rounded-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-dark-700 font-bold text-xs">
                          #{ord.id.slice(-4)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-dark-900">{ord.customer || "Walk-in Customer"}</div>
                          <div className="text-[10px] text-dark-500 font-medium">{ord.product || "Standard Service"} • {ord.date}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-black text-dark-900">₹{Number(ord.total || 0).toLocaleString()}</div>
                        <span className={cn(
                          "text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider inline-block mt-0.5",
                          ord.payment_status === "Paid" ? "bg-emerald-100 text-emerald-800" :
                          ord.payment_status === "Partial" ? "bg-blue-100 text-blue-800" :
                          "bg-amber-100 text-amber-800"
                        )}>
                          {ord.payment_status || "Pending"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Branch Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
              <h3 className="text-xs font-black text-dark-900 uppercase tracking-widest pb-3 border-b border-gray-100">
                Quick Navigation
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href={`/${branch}`}
                  className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors text-center"
                >
                  <ShoppingBag size={18} className="text-dark-700" />
                  <span className="text-[10px] font-bold text-dark-900 uppercase tracking-wider">POS Billing</span>
                </Link>

                <Link
                  href={`/${branch}/history`}
                  className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors text-center"
                >
                  <FileText size={18} className="text-dark-700" />
                  <span className="text-[10px] font-bold text-dark-900 uppercase tracking-wider">Orders</span>
                </Link>

                <Link
                  href={`/${branch}/customers`}
                  className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors text-center"
                >
                  <Users size={18} className="text-dark-700" />
                  <span className="text-[10px] font-bold text-dark-900 uppercase tracking-wider">Customers</span>
                </Link>

                <Link
                  href={`/${branch}/expenses`}
                  className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors text-center"
                >
                  <Wallet size={18} className="text-dark-700" />
                  <span className="text-[10px] font-bold text-dark-900 uppercase tracking-wider">Expenses</span>
                </Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </SidebarLayout>
  );
}
