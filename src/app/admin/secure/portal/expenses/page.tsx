"use client";

import { AdminSidebarLayout } from "@/components/AdminSidebarLayout";
import { Wallet, Filter, ArrowUpDown } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CATEGORIES = [
  "Equipment",
  "Studio Rent",
  "Utilities",
  "Salaries",
  "Supplies",
  "Maintenance",
  "Marketing",
  "ORDER",
  "Other"
];

const BRANCHES = [
  { id: "chennai-main", label: "Chennai Main" },
  { id: "bangalore-hub", label: "Bangalore Hub" },
  { id: "mumbai-central", label: "Mumbai Central" }
];

export default function ExpensesPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [notes, setNotes] = useState("");
  const [period, setPeriod] = useState("Today");
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [sortBy, setSortBy] = useState("date-desc");
  const [orderNo, setOrderNo] = useState("");
  const [branch, setBranch] = useState("chennai-main");
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadExpenses = async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });
    
    if (data && !error) {
      setExpenses(data);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleSave = async () => {
    if (!amount) return alert("Please enter an amount");
    
    setLoading(true);
    let finalNotes = notes;

    if (category === "ORDER") {
      if (!orderNo.trim()) {
        alert("Please enter the Order No");
        setLoading(false);
        return;
      }

      // Check if order exists
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('id')
        .eq('id', orderNo.trim())
        .single();
      
      if (orderError || !orderData) {
        alert(`Order No ${orderNo} not found in database. Please check the ID.`);
        setLoading(false);
        return;
      }

      finalNotes = `Order ID: ${orderNo.trim()}${notes ? ` | ${notes}` : ''}`;
    }

    const { error } = await supabase.from('expenses').insert({
      branch_id: branch,
      date,
      category,
      amount: parseFloat(amount),
      payment_mode: paymentMode,
      notes: finalNotes
    });

    if (error) {
      alert("Failed to save expense");
    } else {
      setAmount("");
      setNotes("");
      setOrderNo("");
      loadExpenses();
    }
    setLoading(false);
  };

  const filteredExpenses = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    
    // 1. Filter by period & branch
    let list = expenses.filter(e => {
      // Period filter
      let matchesPeriod = true;
      if (period === "Today") matchesPeriod = e.date === today;
      else if (period === "Yesterday") {
        const yest = new Date(now);
        yest.setDate(now.getDate() - 1);
        matchesPeriod = e.date === yest.toISOString().split('T')[0];
      }
      else if (period === "This Week") {
        const day = now.getDay();
        const diffToMon = day === 0 ? -6 : 1 - day;
        const mon = new Date(now);
        mon.setDate(now.getDate() + diffToMon);
        matchesPeriod = e.date >= mon.toISOString().split('T')[0];
      }
      else if (period === "This Month") {
        const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        matchesPeriod = (e.date || '').startsWith(monthPrefix);
      }

      // Branch filter
      let matchesBranch = true;
      if (selectedBranch !== "ALL") {
        matchesBranch = (e.branch_id || '').toLowerCase() === selectedBranch.toLowerCase();
      }

      return matchesPeriod && matchesBranch;
    });

    // 2. Sorting logic
    return list.sort((a, b) => {
      if (sortBy === "date-desc") return (b.date || "").localeCompare(a.date || "");
      if (sortBy === "date-asc") return (a.date || "").localeCompare(b.date || "");
      if (sortBy === "amount-desc") return Number(b.amount || 0) - Number(a.amount || 0);
      if (sortBy === "amount-asc") return Number(a.amount || 0) - Number(b.amount || 0);
      if (sortBy === "category") return (a.category || "").localeCompare(b.category || "");
      return 0;
    });
  }, [expenses, period, selectedBranch, sortBy]);

  const total = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <AdminSidebarLayout>
      <div className="flex flex-col gap-6 h-full pb-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-gray-900 rounded-full inline-block"></span>
              Expenses
            </h2>
            <p className="text-sm text-gray-500 mt-1 pl-3.5 font-medium">Log and analyze day-to-day studio spending</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Add Expense Form (White & Gray Theme) */}
          <div className="w-full lg:w-[400px] bg-white rounded-2xl shadow-sm border border-gray-200 shrink-0 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100 bg-gray-50/80">
              <h3 className="text-sm font-bold text-gray-900 tracking-widest uppercase flex items-center gap-2">
                <Wallet className="text-gray-700" size={18} />
                Add an expense
              </h3>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Branch</label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-gray-400 focus:bg-white rounded-xl px-4 py-2.5 outline-none transition-colors text-sm font-bold text-gray-900 uppercase tracking-wider"
                >
                  {BRANCHES.map(b => <option key={b.id} value={b.id}>{b.label.toUpperCase()}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Date</label>
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-gray-400 focus:bg-white rounded-xl px-4 py-2.5 outline-none transition-colors text-sm font-semibold text-gray-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-gray-400 focus:bg-white rounded-xl px-4 py-2.5 outline-none transition-colors text-sm font-bold text-gray-900 uppercase tracking-wider"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {category === "ORDER" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-[10px] font-bold text-gray-900 mb-1.5 uppercase tracking-widest">Order No</label>
                  <input 
                    type="text" 
                    value={orderNo}
                    onChange={(e) => setOrderNo(e.target.value)}
                    placeholder="e.g. INV-2026-XXXX"
                    className="w-full bg-gray-100 border border-gray-300 focus:border-gray-600 focus:bg-white rounded-xl px-4 py-2.5 outline-none transition-colors text-sm font-black text-gray-900 uppercase"
                  />
                  <p className="text-[9px] text-gray-500 mt-1.5 ml-1 font-medium italic">* We will verify this ID in the database before saving.</p>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Amount (₹)</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gray-50 border border-gray-200 focus:border-gray-400 focus:bg-white rounded-xl px-4 py-2.5 outline-none transition-colors text-sm font-black text-gray-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Expense Method</label>
                <select 
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-gray-400 focus:bg-white rounded-xl px-4 py-2.5 outline-none transition-colors text-sm font-bold text-gray-900 uppercase tracking-wider"
                >
                  <option value="Cash">Cash</option>
                  <option value="GPay">GPay</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Notes (optional)</label>
                <input 
                  type="text" 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. printer paper & ink"
                  className="w-full bg-gray-50 border border-gray-200 focus:border-gray-400 focus:bg-white rounded-xl px-4 py-2.5 outline-none transition-colors text-xs font-medium text-gray-900"
                />
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-black disabled:opacity-50 text-white py-4 font-bold text-[10px] uppercase tracking-widest transition-colors mt-auto"
            >
              {loading ? "Saving..." : "Save Expense"}
            </button>
          </div>

          {/* Expenses List, Filtering & Summary (White & Gray Theme) */}
          <div className="flex-1 w-full flex flex-col h-full min-h-[400px]">
            
            {/* Filter & Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              
              <div className="flex flex-wrap items-center gap-2">
                {/* Period Filter */}
                <select 
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="bg-white border border-gray-200 rounded-full px-4 py-2 outline-none focus:border-gray-400 text-[10px] font-bold text-gray-900 uppercase tracking-widest shadow-sm hover:border-gray-300 transition-colors"
                >
                  <option>Today</option>
                  <option>Yesterday</option>
                  <option>This Week</option>
                  <option>This Month</option>
                  <option value="ALL">All Time</option>
                </select>

                {/* Branch Filter */}
                <div className="relative flex items-center">
                  <select 
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="bg-white border border-gray-200 rounded-full px-4 py-2 outline-none focus:border-gray-400 text-[10px] font-bold text-gray-900 uppercase tracking-widest shadow-sm hover:border-gray-300 transition-colors"
                  >
                    <option value="ALL">All Branches</option>
                    {BRANCHES.map(b => (
                      <option key={b.id} value={b.id}>{b.label}</option>
                    ))}
                  </select>
                </div>

                {/* Sort Option */}
                <div className="relative flex items-center">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white border border-gray-200 rounded-full px-4 py-2 outline-none focus:border-gray-400 text-[10px] font-bold text-gray-900 uppercase tracking-widest shadow-sm hover:border-gray-300 transition-colors"
                  >
                    <option value="date-desc">Date: Newest First</option>
                    <option value="date-asc">Date: Oldest First</option>
                    <option value="amount-desc">Amount: High to Low</option>
                    <option value="amount-asc">Amount: Low to High</option>
                    <option value="category">Sort by Category</option>
                  </select>
                </div>
              </div>

              {/* Total Card */}
              <div className="bg-white border border-gray-200 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-sm">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total</span>
                <span className="text-sm font-black text-gray-900">₹{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Expenses List Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden" style={{ height: '520px' }}>
              {filteredExpenses.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center opacity-60 p-10 min-h-[300px]">
                  <Wallet size={40} strokeWidth={1.5} className="text-gray-400 mb-4" />
                  <h3 className="text-sm font-bold text-gray-900 mb-1 uppercase tracking-widest">No expenses logged</h3>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">No matching expenses found for the selected filters.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 overflow-y-auto h-full">
                  {filteredExpenses.map((exp, idx) => (
                    <div key={idx} className="p-4 flex justify-between items-start hover:bg-gray-50/80 transition-colors gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-gray-900">{exp.category}</span>
                          {exp.category === 'ORDER' && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-800 border border-gray-200 text-[9px] font-bold uppercase rounded-full tracking-wider">
                              Order Specific
                            </span>
                          )}
                          {exp.branch_id && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-200 text-[9px] font-bold uppercase rounded-full tracking-wider">
                              {exp.branch_id.replace(/-/g, ' ')}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-500 font-medium mt-0.5">{exp.date} • {exp.payment_mode}</div>
                        {exp.notes && <div className="text-[10px] text-gray-500 italic mt-1 font-semibold truncate max-w-xs">{exp.notes}</div>}
                      </div>
                      <div className="text-sm font-black text-red-600 shrink-0">
                        -₹{Number(exp.amount).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
          </div>

        </div>

      </div>
    </AdminSidebarLayout>
  );
}
