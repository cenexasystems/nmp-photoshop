"use client";

import { SidebarLayout } from "@/components/SidebarLayout";
import { Wallet, Calendar } from "lucide-react";
import { useState } from "react";
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
  "Other"
];

export default function ExpensesPage() {
  const [date, setDate] = useState("2026-07-08");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [period, setPeriod] = useState("Today");

  // Keeping it purely UI as requested
  const expenses: any[] = [];
  const total = 0;

  return (
    <SidebarLayout>
      <div className="flex flex-col gap-8 h-full pb-10">
        
        {/* Header Section */}
        <div>
          <h4 className="text-[10px] font-bold text-gold-600 uppercase tracking-[0.2em] mb-1">Studio Outgoings</h4>
          <h2 className="text-3xl font-black text-[#5c4a16]">Expenses</h2>
          <p className="text-sm text-gold-700 mt-1">Log day-to-day studio spending alongside your orders.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Add Expense Form */}
          <div className="w-full lg:w-[450px] bg-white rounded-2xl shadow-sm border border-gold-200 overflow-hidden shrink-0">
            <div className="p-6 border-b border-gold-100 bg-gold-50/30">
              <h3 className="font-bold text-dark-900">Add an expense</h3>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gold-800 mb-2 uppercase tracking-wide">Date</label>
                <div className="relative">
                  <input 
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white border border-gold-200 rounded-xl px-4 py-3 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all font-medium text-dark-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gold-800 mb-2 uppercase tracking-wide">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-gold-200 rounded-xl px-4 py-3 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all font-medium"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gold-800 mb-2 uppercase tracking-wide">Amount</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white border border-gold-200 rounded-xl px-4 py-3 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gold-800 mb-2 uppercase tracking-wide">Notes (optional)</label>
                <input 
                  type="text" 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. printer paper & ink"
                  className="w-full bg-white border border-gold-200 rounded-xl px-4 py-3 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all font-medium"
                />
              </div>
            </div>

            <button className="w-full bg-[#c25e30] hover:bg-[#a64e26] text-white py-4 font-bold text-sm transition-colors text-center">
              Save expense
            </button>
          </div>

          {/* Expenses List & Summary */}
          <div className="flex-1 w-full flex flex-col h-full min-h-[400px]">
            
            <div className="flex justify-between items-center mb-6">
              <select 
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="bg-white border border-gold-200 rounded-xl px-4 py-2 outline-none focus:border-gold-400 text-sm font-bold text-dark-900 shadow-sm"
              >
                <option>Today</option>
                <option>Yesterday</option>
                <option>This Week</option>
                <option>This Month</option>
              </select>

              <div className="bg-gold-200/50 border border-gold-200 rounded-full px-4 py-1.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#c25e30]"></span>
                <span className="text-xs font-bold text-gold-800 uppercase tracking-wide">Total</span>
                <span className="text-sm font-black text-dark-900">₹{total}</span>
              </div>
            </div>

            {expenses.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center opacity-60 mt-10">
                <Wallet size={48} className="text-gold-500 mb-4 stroke-[1.5]" />
                <h3 className="text-xl font-bold text-dark-900 mb-2">No expenses logged</h3>
                <p className="text-sm text-gold-700">Add one on the left to start tracking outgoings.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Future list goes here */}
              </div>
            )}
            
          </div>

        </div>

      </div>
    </SidebarLayout>
  );
}
