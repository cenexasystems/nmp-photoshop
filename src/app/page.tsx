"use client";

import { SidebarLayout } from "@/components/SidebarLayout";
import { User, Search, Trash2, Plus, List, CreditCard, Camera } from "lucide-react";
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

interface CartItem {
  id: number;
  product: string;
  details: string;
  amount: number;
  idNumber?: string;
  deliveryDate?: string;
}

export default function Home() {
  // Global Order State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerDate, setCustomerDate] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  
  // Current Item State
  const [product, setProduct] = useState(PRODUCTS[0]);
  const [idNumber, setIdNumber] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [details, setDetails] = useState("");
  const [amount, setAmount] = useState("");
  
  // Order Level Settings
  const [amountStatus, setAmountStatus] = useState(AMOUNT_STATUSES[1]);
  const [paymentMode, setPaymentMode] = useState(PAYMENT_MODES[0]);
  const [deliveryStatus, setDeliveryStatus] = useState(DELIVERY_STATUSES[0]);
  const [notes, setNotes] = useState("");

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 10) setCustomerPhone(val);
  };

  const addToCart = () => {
    if (!amount) return;
    const newItem: CartItem = {
      id: Date.now(),
      product,
      details,
      amount: parseFloat(amount) || 0,
    };
    if (product === "Passport") newItem.idNumber = idNumber;
    if (product === "Frame") newItem.deliveryDate = deliveryDate;

    setCart([...cart, newItem]);
    
    // Reset item form
    setDetails("");
    setAmount("");
    setIdNumber("");
    setDeliveryDate("");
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.amount, 0);

  const handleWhatsApp = () => {
    const target = customerPhone.length === 10 ? customerPhone : "7904199050";
    let text = `*New Order from Golden Retail* 📸\n\n`;
    text += `*Customer:* ${customerName || 'Walk-in'}\n`;
    if (customerDate) text += `*Date:* ${customerDate}\n`;
    text += `\n*Items:*\n`;
    cart.forEach((item, i) => {
      text += `${i+1}. ${item.product} - ₹${item.amount}\n`;
      if (item.details) text += `   └ Details: ${item.details}\n`;
      if (item.idNumber) text += `   └ ID: ${item.idNumber}\n`;
      if (item.deliveryDate) text += `   └ Delivery: ${item.deliveryDate}\n`;
    });
    text += `\n*Total Amount:* ₹${cartTotal.toLocaleString()}\n`;
    text += `*Payment Status:* ${amountStatus}\n`;
    text += `*Payment Mode:* ${paymentMode}\n`;
    if (notes) text += `*Notes:* ${notes}\n`;
    text += `\nThank you for choosing Golden Retail! ✨`;
    
    window.open(`https://wa.me/91${target}?text=${encodeURIComponent(text)}`, "_blank");
  };
  
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
            
            {/* Mobile Toggle */}
            <div className="lg:hidden flex items-center gap-2" onClick={() => setIsOnline(!isOnline)}>
              <span className="text-xs font-bold text-gold-800 uppercase">Offline</span>
              <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${isOnline ? 'bg-green-500' : 'bg-[#5c4a16]'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isOnline ? 'translate-x-6' : ''}`}></div>
              </div>
              <span className="text-xs font-bold text-gold-800 uppercase">Online</span>
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
                  maxLength={10}
                  value={customerPhone}
                  onChange={handlePhoneChange}
                  placeholder="10-digit number"
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
                Add Product to Order
              </h3>
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
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-bold text-gold-800 mb-2 uppercase tracking-wide">Amount (₹)</label>
                  <div className="flex gap-4">
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-gold-50 border border-gold-200 rounded-xl px-4 py-3 outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all font-bold"
                    />
                    <button 
                      onClick={addToCart}
                      disabled={!amount}
                      className="shrink-0 flex items-center gap-2 px-6 bg-[#5c4a16] hover:bg-gold-900 text-white rounded-xl font-bold uppercase tracking-wide transition-colors disabled:opacity-50"
                    >
                      <Plus size={20} /> Add Item
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side (Summary) */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6">
          
          {/* Status Pills */}
          <div className="flex justify-end gap-3 hidden lg:flex items-center">
            <button 
              onClick={() => setIsOnline(false)}
              className={cn("px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2 shadow-sm transition-all border", 
                !isOnline ? "bg-[#5c4a16] text-white border-transparent" : "bg-white text-gold-600 border-gold-200"
              )}
            >
              {!isOnline && <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>}
              Offline (POS)
            </button>
            <button 
              onClick={() => setIsOnline(true)}
              className={cn("px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2 shadow-sm transition-all border", 
                isOnline ? "bg-green-600 text-white border-transparent" : "bg-white text-gold-600 border-gold-200"
              )}
            >
              {isOnline && <span className="w-2 h-2 rounded-full bg-white"></span>}
              Online Order
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gold-200 flex flex-col sticky top-6">
            <div className="p-6 border-b border-gold-100 flex items-center justify-between bg-gold-50/30 rounded-t-2xl">
              <h3 className="text-lg font-bold text-dark-900 flex items-center gap-2">
                <CreditCard className="text-gold-500" size={20} />
                Current Order
              </h3>
              <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 uppercase tracking-wide",
                isOnline ? "bg-green-50 text-green-600 border-green-200" : "bg-red-50 text-red-600 border-red-100"
              )}>
                <span className={cn("w-1.5 h-1.5 rounded-full", isOnline ? "bg-green-500" : "bg-red-500")}></span>
                {isOnline ? "Online" : "Offline (POS)"}
              </div>
            </div>

            <div className="p-6 space-y-6">
              
              <div className="space-y-3 pb-4 border-b border-gold-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gold-700 font-semibold text-xs uppercase tracking-wide">Customer</span>
                  <span className="font-bold text-dark-900">{customerName || "-"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gold-700 font-semibold text-xs uppercase tracking-wide">Phone</span>
                  <span className="font-bold text-dark-900">{customerPhone || "-"}</span>
                </div>
              </div>

              {/* Cart Items List */}
              <div className="space-y-3 max-h-[300px] overflow-auto pr-2">
                {cart.length === 0 ? (
                  <div className="h-24 flex items-center justify-center border border-dashed border-gold-300 rounded-xl bg-gold-50/50">
                    <span className="text-sm font-medium text-gold-600 italic">No items added yet</span>
                  </div>
                ) : (
                  cart.map((item, index) => (
                    <div key={item.id} className="bg-gold-50 p-3 rounded-xl border border-gold-200 flex justify-between gap-3 group relative">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-dark-900 text-sm flex items-center gap-2">
                          {item.product}
                        </div>
                        {item.details && <div className="text-xs text-gold-700 mt-1 truncate">{item.details}</div>}
                        {item.idNumber && <div className="text-[10px] font-bold text-[#5c4a16] mt-1 bg-gold-200/50 inline-block px-1.5 py-0.5 rounded">ID: {item.idNumber}</div>}
                        {item.deliveryDate && <div className="text-[10px] font-bold text-[#5c4a16] mt-1 bg-gold-200/50 inline-block px-1.5 py-0.5 rounded">Deliver: {item.deliveryDate}</div>}
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end justify-between">
                        <span className="font-black text-dark-900">₹{item.amount}</span>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 p-1">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-gold-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gold-800 mb-1.5 uppercase tracking-wide">Payment Status</label>
                    <select 
                      value={amountStatus}
                      onChange={(e) => setAmountStatus(e.target.value)}
                      className="w-full bg-gold-50 border border-gold-200 rounded-lg px-2 py-2 outline-none focus:border-gold-400 text-xs font-bold"
                    >
                      {AMOUNT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gold-800 mb-1.5 uppercase tracking-wide">Payment Mode</label>
                    <select 
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className="w-full bg-gold-50 border border-gold-200 rounded-lg px-2 py-2 outline-none focus:border-gold-400 text-xs font-bold"
                    >
                      {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gold-800 mb-1.5 uppercase tracking-wide">Delivery</label>
                    <select 
                      value={deliveryStatus}
                      onChange={(e) => setDeliveryStatus(e.target.value)}
                      className="w-full bg-gold-50 border border-gold-200 rounded-lg px-2 py-2 outline-none focus:border-gold-400 text-xs font-bold"
                    >
                      {DELIVERY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gold-800 mb-1.5 uppercase tracking-wide">Notes</label>
                  <input 
                    type="text" 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Order notes..."
                    className="w-full bg-gold-50 border border-gold-200 rounded-lg px-3 py-2 outline-none focus:border-gold-400 text-xs font-medium"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gold-50 rounded-b-2xl border-t border-gold-200">
              <div className="flex justify-between items-end mb-6">
                <span className="text-sm font-bold text-gold-800 uppercase tracking-widest">Grand Total</span>
                <span className="text-3xl font-black text-[#5c4a16]">₹{cartTotal.toLocaleString()}</span>
              </div>

              <button 
                onClick={handleWhatsApp}
                disabled={cart.length === 0}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-4 font-bold text-sm uppercase tracking-widest transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Bill via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
