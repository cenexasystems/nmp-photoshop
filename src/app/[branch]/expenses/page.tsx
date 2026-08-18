"use client";

import { SidebarLayout } from "@/components/SidebarLayout";
import { Wallet, Search } from "lucide-react";
import { useState, useEffect, useMemo, use } from "react";
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

export default function BranchExpensesPage({ params }: { params: Promise<{ branch: string }> }) {
  const { branch } = use(params);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [notes, setNotes] = useState("");
  const [orderNo, setOrderNo] = useState("");
  const [period, setPeriod] = useState("Today");
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadExpenses = async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('branch_id', branch)
      .order('date', { ascending: false });
    
    if (data && !error) {
      setExpenses(data);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [branch]);

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
      alert("Failed to save expense. Make sure RLS is disabled or you have permissions.");
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
    return expenses.filter(e => {
      if (period === "Today") return e.date === today;
      return true; 
    });
  }, [expenses, period]);

  const total = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <SidebarLayout>
      <div className="flex flex-col gap-6 h-full pb-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-dark-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-gray-900 rounded-full inline-block"></span>
              Branch Expenses
            </h2>
            <p className="text-sm text-dark-500 mt-1 pl-3.5 font-medium">Log day-to-day spending and order-specific costs</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Add Expense Form */}
          <div className="w-full lg:w-[400px] bg-white rounded-2xl shadow-sm border border-gray-200 shrink-0 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100 bg-gray-50/80">
              <h3 className="text-sm font-bold text-dark-900 tracking-widest uppercase flex items-center gap-2">
                <Wallet className="text-gray-700" size={18} />
                Add an expense
              </h3>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-dark-500 mb-1.5 uppercase tracking-widest">Date</label>
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-gray-400 focus:bg-white rounded-xl px-4 py-2.5 outline-none transition-colors text-sm font-semibold text-dark-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-dark-500 mb-1.5 uppercase tracking-widest">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-gray-400 focus:bg-white rounded-xl px-4 py-2.5 outline-none transition-colors text-sm font-bold text-dark-900 uppercase tracking-wider"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {category === "ORDER" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-[10px] font-bold text-gray-700 mb-1.5 uppercase tracking-widest">Order No</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={16} />
                    <input 
                      type="text" 
                      value={orderNo}
                      onChange={(e) => setOrderNo(e.target.value)}
                      placeholder="e.g. NMG-2026-XXXX"
                      className="w-full bg-gray-100 border border-gray-300 focus:border-gray-400 focus:bg-white rounded-xl pl-9 pr-4 py-2.5 outline-none transition-colors text-sm font-black text-dark-900 uppercase"
                    />
                  </div>
                  <p className="text-[9px] text-dark-500 mt-1.5 ml-1 font-medium italic">* We will verify this ID in the database before saving.</p>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-dark-500 mb-1.5 uppercase tracking-widest">Amount (₹)</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gray-50 border border-gray-200 focus:border-gray-400 focus:bg-white rounded-xl px-4 py-2.5 outline-none transition-colors text-sm font-black text-dark-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-dark-500 mb-1.5 uppercase tracking-widest">Expense Method</label>
                <select 
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-gray-400 focus:bg-white rounded-xl px-4 py-2.5 outline-none transition-colors text-sm font-bold text-dark-900 uppercase tracking-wider"
                >
                  <option value="Cash">Cash</option>
                  <option value="GPay">GPay</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-dark-500 mb-1.5 uppercase tracking-widest">Notes (optional)</label>
                <input 
                  type="text" 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. printer paper & ink"
                  className="w-full bg-gray-50 border border-gray-200 focus:border-gray-400 focus:bg-white rounded-xl px-4 py-2.5 outline-none transition-colors text-xs font-medium text-dark-900"
                />
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-dark-900 hover:bg-dark-800 disabled:opacity-50 text-white py-4 font-bold text-[10px] uppercase tracking-widest transition-colors mt-auto"
            >
              {loading ? "Saving..." : "Save Expense"}
            </button>
          </div>

          {/* Expenses List & Summary */}
          <div className="flex-1 w-full flex flex-col h-full min-h-[400px]">
            
            <div className="flex justify-between items-center mb-4">
              <select 
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="bg-white border border-gray-200 rounded-full px-4 py-2 outline-none focus:border-gray-400 text-[10px] font-bold text-dark-900 uppercase tracking-widest shadow-sm"
              >
                <option>Today</option>
                <option>All Time</option>
              </select>

              <div className="bg-white border border-gray-200 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-sm">
                <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Total</span>
                <span className="text-sm font-black text-dark-900">₹{total}</span>
              </div>
            </div>

            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
              {filteredExpenses.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center opacity-60 p-10 min-h-[300px]">
                  <Wallet size={40} strokeWidth={1.5} className="text-gray-400 mb-4" />
                  <h3 className="text-sm font-bold text-dark-900 mb-1 uppercase tracking-widest">No expenses logged</h3>
                  <p className="text-[10px] font-bold text-dark-500 uppercase tracking-widest text-center">Add one on the left to start tracking outgoings.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 overflow-y-auto">
                  {filteredExpenses.map((exp, idx) => (
                    <div key={idx} className="p-4 flex justify-between items-center hover:bg-gray-50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-dark-900">{exp.category}</span>
                          {exp.category === 'ORDER' && (
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-800 text-[9px] font-bold uppercase rounded-full tracking-wider">Order Specific</span>
                          )}
                        </div>
                        <div className="text-[10px] text-dark-500 font-medium mt-0.5">{exp.date} • {exp.payment_mode}</div>
                        {exp.notes && <div className="text-[10px] text-dark-400 italic mt-1 font-semibold">{exp.notes}</div>}
                      </div>
                      <div className="text-sm font-black text-red-600">
                        -₹{exp.amount}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
          </div>

        </div>

      </div>
    </SidebarLayout>
  );
}
