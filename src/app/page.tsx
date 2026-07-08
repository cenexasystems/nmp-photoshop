"use client";

import { SidebarLayout } from "@/components/SidebarLayout";
import { User, Phone, Search, Trash2, Plus, List, CreditCard, Calendar, Camera } from "lucide-react";
import { useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PRODUCTS = ["Portrait", "Passport", "Print", "Frame", "Gift", "Photo Shoot"];
const PAYMENT_MODES = ["Cash", "GPay", "Card", "Bank Transfer", "Others"];
const DELIVERY_STATUSES = ["Pending", "In Progress", "Delivered"];
const AMOUNT_STATUSES = ["Paid", "Unpaid", "Partial"];

export default function Home() {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerDate, setCustomerDate] = useState("");
  
  const [product, setProduct] = useState(PRODUCTS[0]);
  const [idNumber, setIdNumber] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [details, setDetails] = useState("");
  const [amount, setAmount] = useState("");
  const [amountStatus, setAmountStatus] = useState(AMOUNT_STATUSES[1]);
  const [paymentMode, setPaymentMode] = useState(PAYMENT_MODES[0]);
  const [deliveryStatus, setDeliveryStatus] = useState(DELIVERY_STATUSES[0]);
  const [notes, setNotes] = useState("");
  
  return (
    <SidebarLayout>
      <div className="flex flex-col lg:flex-row gap-6 h-full pb-10">
        
        {/* Left Side (Customer & Items) */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#5c4a16] flex items-center gap-2">
                <span className="w-1.5 h-6 bg-gold-400 rounded-full inline-block"></span>
                POS Billing Panel
              </h2>
              <p className="text-sm text-gold-700 mt-1 pl-3.5">Quick invoice generator & database synced checkout</p>
            </div>
          </div>

          {/* Customer Details Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gold-200">
            <h3 className="text-lg font-bold text-dark-900 mb-4 flex items-center gap-2">
              <User className="text-gold-500" size={20} />
              Customer Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gold-800 mb-2 uppercase tracking-wide">Customer Name</label>
                <input 
                  type="text" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter name"
                  className="w-full bg-gold-50 border border-gold-200 rounded-xl px-4 py-3 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gold-800 mb-2 uppercase tracking-wide">Mobile Number</label>
                <input 
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Enter 10-digit number"
                  className="w-full bg-gold-50 border border-gold-200 rounded-xl px-4 py-3 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gold-800 mb-2 uppercase tracking-wide">Date</label>
                <input 
                  type="date"
                  value={customerDate}
                  onChange={(e) => setCustomerDate(e.target.value)}
                  className="w-full bg-gold-50 border border-gold-200 rounded-xl px-4 py-3 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all font-medium text-dark-900"
                />
              </div>
            </div>
          </div>

          {/* Product Form Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gold-200 flex-1 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-lg font-bold text-dark-900 flex items-center gap-2">
                <Camera className="text-gold-500" size={20} />
                Product Details
              </h3>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-gold-800 bg-gold-100 hover:bg-gold-200 font-bold text-xs uppercase tracking-wide transition-colors">
                  <Trash2 size={16} />
                  Clear Form
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Type */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-bold text-gold-800 mb-3 uppercase tracking-wide">Select Product</label>
                  <div className="flex flex-wrap gap-3">
                    {PRODUCTS.map(p => (
                      <button
                        key={p}
                        onClick={() => setProduct(p)}
                        className={cn(
                          "px-4 py-2 rounded-full text-sm font-bold transition-all uppercase tracking-wide border",
                          product === p 
                            ? "bg-[#5c4a16] text-white border-[#5c4a16] shadow-sm" 
                            : "bg-white text-gold-700 border-gold-200 hover:border-gold-400"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conditional Passport ID */}
                {product === "Passport" && (
                  <div className="col-span-1 md:col-span-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-xs font-bold text-gold-800 mb-2 uppercase tracking-wide">ID Number</label>
                    <input 
                      type="text" 
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder="Enter Passport ID"
                      className="w-full bg-gold-50 border border-gold-200 rounded-xl px-4 py-3 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all font-medium"
                    />
                  </div>
                )}

                {/* Conditional Delivery Date for Frame */}
                {product === "Frame" && (
                  <div className="col-span-1 md:col-span-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-xs font-bold text-gold-800 mb-2 uppercase tracking-wide">Delivery Date</label>
                    <input 
                      type="date" 
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full bg-gold-50 border border-gold-200 rounded-xl px-4 py-3 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all font-medium text-dark-900"
                    />
                  </div>
                )}

                {/* Details */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-bold text-gold-800 mb-2 uppercase tracking-wide">Details</label>
                  <input 
                    type="text" 
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Enter details..."
                    className="w-full bg-gold-50 border border-gold-200 rounded-xl px-4 py-3 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all font-medium"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-bold text-gold-800 mb-2 uppercase tracking-wide">Amount (₹)</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-gold-50 border border-gold-200 rounded-xl px-4 py-3 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all font-bold"
                  />
                </div>

                {/* Amount Status */}
                <div>
                  <label className="block text-xs font-bold text-gold-800 mb-2 uppercase tracking-wide">Amount Status</label>
                  <select 
                    value={amountStatus}
                    onChange={(e) => setAmountStatus(e.target.value)}
                    className="w-full bg-gold-50 border border-gold-200 rounded-xl px-4 py-3 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all font-medium"
                  >
                    {AMOUNT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Mode of Payment */}
                <div>
                  <label className="block text-xs font-bold text-gold-800 mb-2 uppercase tracking-wide">Mode of Payment</label>
                  <select 
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full bg-gold-50 border border-gold-200 rounded-xl px-4 py-3 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all font-medium"
                  >
                    {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                {/* Delivery Status */}
                <div>
                  <label className="block text-xs font-bold text-gold-800 mb-2 uppercase tracking-wide">Delivery Status</label>
                  <select 
                    value={deliveryStatus}
                    onChange={(e) => setDeliveryStatus(e.target.value)}
                    className="w-full bg-gold-50 border border-gold-200 rounded-xl px-4 py-3 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all font-medium"
                  >
                    {DELIVERY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Optional Notes */}
                <div className="col-span-1 md:col-span-2 mt-2">
                  <label className="block text-xs font-bold text-gold-800 mb-2 uppercase tracking-wide">Optional Notes</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any extra instructions here..."
                    rows={3}
                    className="w-full bg-gold-50 border border-gold-200 rounded-xl px-4 py-3 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all font-medium resize-none"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side (Summary) */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6">
          
          {/* Status Pills */}
          <div className="flex justify-end gap-3 hidden lg:flex">
            <div className="bg-[#5c4a16] text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
              Offline (POS)
            </div>
            <div className="bg-white border border-gold-200 text-gold-800 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Online Order
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gold-200 flex flex-col sticky top-6">
            <div className="p-6 border-b border-gold-100 flex items-center justify-between bg-gold-50/30 rounded-t-2xl">
              <h3 className="text-lg font-bold text-dark-900 flex items-center gap-2">
                <CreditCard className="text-gold-500" size={20} />
                Current Order
              </h3>
              <div className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-bold border border-red-100 flex items-center gap-1.5 uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                Offline (POS)
              </div>
            </div>

            <div className="p-6 space-y-6">
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gold-700 font-semibold text-xs uppercase tracking-wide">Source</span>
                  <span className="font-bold text-red-500 border border-red-200 px-2 py-0.5 rounded text-[10px] uppercase tracking-wide bg-red-50">Offline</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gold-700 font-semibold text-xs uppercase tracking-wide">Customer</span>
                  <span className="font-bold text-dark-900">{customerName || "-"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gold-700 font-semibold text-xs uppercase tracking-wide">Phone</span>
                  <span className="font-bold text-dark-900">{customerPhone || "-"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gold-700 font-semibold text-xs uppercase tracking-wide">Product</span>
                  <span className="font-bold text-[#5c4a16]">{product}</span>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gold-100">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gold-700 font-medium">Subtotal</span>
                    <span className="font-bold">₹{amount || "0.00"}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gold-700 font-medium">Status</span>
                    <span className={cn(
                      "font-bold text-[10px] uppercase px-2 py-0.5 rounded border",
                      amountStatus === "Paid" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                      amountStatus === "Unpaid" ? "bg-red-50 text-red-600 border-red-200" :
                      "bg-amber-50 text-amber-600 border-amber-200"
                    )}>{amountStatus}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gold-50 rounded-b-2xl border-t border-gold-200">
              <div className="flex justify-between items-end mb-6">
                <span className="text-sm font-bold text-gold-800 uppercase tracking-widest">Grand Total</span>
                <span className="text-3xl font-black text-[#5c4a16]">₹{amount || "0.00"}</span>
              </div>

              <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-4 font-bold text-sm uppercase tracking-widest transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2">
                Generate Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
