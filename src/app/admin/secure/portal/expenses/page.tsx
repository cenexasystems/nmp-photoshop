"use client";

import { AdminSidebarLayout } from "@/components/AdminSidebarLayout";
import { Wallet } from "lucide-react";
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
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [notes, setNotes] = useState("");
  const [period, setPeriod] = useState("Today");

  // Keeping it purely UI as requested
  const expenses: any[] = [];
  const total = 0;

  return (
    <AdminSidebarLayout>
      <div className="flex flex-col gap-6 h-full pb-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-dark-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-brand-gold rounded-full inline-block"></span>
              Expenses
            </h2>
            <p className="text-sm text-dark-500 mt-1 pl-3.5 font-medium">Log day-to-day studio spending</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Add Expense Form */}
          <div className="w-full lg:w-[400px] bg-white rounded-2xl shadow-sm border border-gold-200 shrink-0 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gold-100 bg-gold-50/50">
              <h3 className="text-sm font-bold text-dark-900 tracking-widest uppercase flex items-center gap-2">
                <Wallet className="text-brand-gold" size={18} />
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
                  className="w-full bg-gold-50 border border-gold-200 focus:border-brand-gold focus:bg-white rounded-xl px-4 py-2.5 outline-none transition-colors text-sm font-semibold text-dark-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-dark-500 mb-1.5 uppercase tracking-widest">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-gold-50 border border-gold-200 focus:border-brand-gold focus:bg-white rounded-xl px-4 py-2.5 outline-none transition-colors text-sm font-bold text-dark-900 uppercase tracking-wider"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-dark-500 mb-1.5 uppercase tracking-widest">Amount (₹)</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gold-50 border border-gold-200 focus:border-brand-gold focus:bg-white rounded-xl px-4 py-2.5 outline-none transition-colors text-sm font-black text-dark-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-dark-500 mb-1.5 uppercase tracking-widest">Expense Method</label>
                <select 
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full bg-gold-50 border border-gold-200 focus:border-brand-gold focus:bg-white rounded-xl px-4 py-2.5 outline-none transition-colors text-sm font-bold text-dark-900 uppercase tracking-wider"
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
                  className="w-full bg-gold-50 border border-gold-200 focus:border-brand-gold focus:bg-white rounded-xl px-4 py-2.5 outline-none transition-colors text-xs font-medium text-dark-900"
                />
              </div>
            </div>

            <button className="w-full bg-dark-900 hover:bg-dark-800 text-white py-4 font-bold text-[10px] uppercase tracking-widest transition-colors mt-auto">
              Save Expense
            </button>
          </div>

          {/* Expenses List & Summary */}
          <div className="flex-1 w-full flex flex-col h-full min-h-[400px]">
            
            <div className="flex justify-between items-center mb-4">
              <select 
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="bg-white border border-gold-200 rounded-full px-4 py-2 outline-none focus:border-brand-gold text-[10px] font-bold text-dark-900 uppercase tracking-widest shadow-sm"
              >
                <option>Today</option>
                <option>Yesterday</option>
                <option>This Week</option>
                <option>This Month</option>
              </select>

              <div className="bg-white border border-gold-200 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-sm">
                <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Total</span>
                <span className="text-sm font-black text-dark-900">₹{total}</span>
              </div>
            </div>

            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gold-200 flex flex-col overflow-hidden">
              {expenses.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center opacity-60 p-10 min-h-[300px]">
                  <Wallet size={40} strokeWidth={1.5} className="text-gold-400 mb-4" />
                  <h3 className="text-sm font-bold text-dark-900 mb-1 uppercase tracking-widest">No expenses logged</h3>
                  <p className="text-[10px] font-bold text-dark-500 uppercase tracking-widest text-center">Add one on the left to start tracking outgoings.</p>
                </div>
              ) : (
                <div className="space-y-3 p-5">
                  {/* Future list goes here */}
                </div>
              )}
            </div>
            
          </div>

        </div>

      </div>
    </AdminSidebarLayout>
  );
}
