"use client";

import { SidebarLayout } from "@/components/SidebarLayout";
import { User, Trash2, Plus, CreditCard, Camera } from "lucide-react";
import { useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PRODUCTS = ["Portrait", "Passport", "Print", "Frame", "Gift", "Photo Shoot"];
const PAYMENT_MODES = ["Cash", "GPay", "Card"];
const DELIVERY_STATUSES = ["Pending", "In Progress", "Delivered"];
const AMOUNT_STATUSES = ["Pending", "Partial", "Completed"];
const STAFF_MEMBERS = ["Admin", "Staff 1", "Staff 2", "Staff 3"];

interface CartItem {
  id: number;
  product: string;
  details: string;
  amount: number;
  idNumber?: string;
  deliveryDate?: string;
  costToMake?: number;
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
  const [costToMake, setCostToMake] = useState("");
  
  // Order Level Settings
  const [staffName, setStaffName] = useState(STAFF_MEMBERS[0]);
  const [amountStatus, setAmountStatus] = useState(AMOUNT_STATUSES[2]);
  const [paymentMode, setPaymentMode] = useState(PAYMENT_MODES[0]);
  const [deliveryStatus, setDeliveryStatus] = useState(DELIVERY_STATUSES[0]);
  const [amountPaid, setAmountPaid] = useState("");
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

    if (product === "Frame" || product === "Print" || product === "Gift") {
      newItem.costToMake = parseFloat(costToMake) || 0;
    }

    setCart([...cart, newItem]);
    
    // Reset item form
    setDetails("");
    setAmount("");
    setIdNumber("");
    setDeliveryDate("");
    setCostToMake("");
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.amount, 0);

  const handleWhatsApp = () => {
    const target = customerPhone.length === 10 ? customerPhone : "7904199050";
    let text = `*New Order from Golden Retail* 📸\n\n`;
    text += `*Customer:* ${customerName || 'Walk-in'} (${customerPhone || 'N/A'})\n`;
    text += `*Staff:* ${staffName}\n`;
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
              <h2 className="text-2xl font-bold text-dark-900 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-brand-gold rounded-full inline-block"></span>
                Billing Station
              </h2>
              <p className="text-sm text-dark-500 mt-1 pl-3.5 font-medium">Create orders & sync database</p>
            </div>
            
            {/* Mobile Toggle */}
            <div className="lg:hidden flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gold-200" onClick={() => setIsOnline(!isOnline)}>
              <span className="text-[10px] font-bold text-dark-600 uppercase tracking-widest">Offline</span>
              <div className={cn("w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors relative", isOnline ? 'bg-green-500' : 'bg-brand-gold')}>
                <div className={cn("w-4 h-4 bg-white rounded-full transition-transform absolute top-0.5", isOnline ? 'translate-x-5' : 'translate-x-0')}></div>
              </div>
              <span className="text-[10px] font-bold text-dark-600 uppercase tracking-widest">Online</span>
            </div>
          </div>

          {/* Customer Details Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gold-200">
            <h3 className="text-sm font-bold text-dark-900 mb-5 tracking-widest uppercase flex items-center gap-2">
              <User className="text-brand-gold" size={18} />
              Customer Info
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-[10px] font-bold text-dark-500 mb-2 uppercase tracking-widest">Customer Name</label>
                <input 
                  type="text" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter name"
                  className="w-full bg-gold-50 border border-gold-200 rounded-xl px-4 py-2.5 outline-none focus:border-brand-gold focus:bg-white transition-all text-sm font-semibold text-dark-900 placeholder-dark-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-dark-500 mb-2 uppercase tracking-widest">Mobile Number</label>
                <input 
                  type="tel"
                  maxLength={10}
                  value={customerPhone}
                  onChange={handlePhoneChange}
                  placeholder="10-digit number"
                  className="w-full bg-gold-50 border border-gold-200 rounded-xl px-4 py-2.5 outline-none focus:border-brand-gold focus:bg-white transition-all text-sm font-semibold text-dark-900 placeholder-dark-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-dark-500 mb-2 uppercase tracking-widest">Date</label>
                <input 
                  type="date"
                  value={customerDate}
                  onChange={(e) => setCustomerDate(e.target.value)}
                  className="w-full bg-gold-50 border border-gold-200 rounded-xl px-4 py-2.5 outline-none focus:border-brand-gold focus:bg-white transition-all text-sm font-semibold text-dark-900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-dark-500 mb-2 uppercase tracking-widest">Handled By (Staff)</label>
                <select 
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full bg-gold-50 border border-gold-200 rounded-xl px-4 py-2.5 outline-none focus:border-brand-gold focus:bg-white transition-all text-sm font-semibold text-dark-900"
                >
                  {STAFF_MEMBERS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Product Form Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gold-200 flex-1 flex flex-col">
            <h3 className="text-sm font-bold text-dark-900 mb-6 tracking-widest uppercase flex items-center gap-2">
              <Camera className="text-brand-gold" size={18} />
              Add Product
            </h3>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Product Type */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-[10px] font-bold text-dark-500 mb-3 uppercase tracking-widest">Select Product</label>
                  <div className="flex flex-wrap gap-2">
                    {PRODUCTS.map(p => (
                      <button
                        key={p}
                        onClick={() => setProduct(p)}
                        className={cn(
                          "px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border",
                          product === p 
                            ? "bg-brand-gold text-white border-brand-gold shadow-sm" 
                            : "bg-white text-dark-600 border-gold-200 hover:border-brand-gold/50 hover:bg-gold-50"
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
                    <label className="block text-[10px] font-bold text-dark-500 mb-2 uppercase tracking-widest">ID Number</label>
                    <input 
                      type="text" 
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder="Enter Passport ID"
                      className="w-full bg-gold-50 border border-gold-200 rounded-xl px-4 py-2.5 outline-none focus:border-brand-gold focus:bg-white transition-all text-sm font-semibold text-dark-900"
                    />
                  </div>
                )}

                {/* Conditional Delivery Date for Frame */}
                {product === "Frame" && (
                  <div className="col-span-1 md:col-span-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-[10px] font-bold text-dark-500 mb-2 uppercase tracking-widest">Delivery Date</label>
                    <input 
                      type="date" 
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full bg-gold-50 border border-gold-200 rounded-xl px-4 py-2.5 outline-none focus:border-brand-gold focus:bg-white transition-all text-sm font-semibold text-dark-900"
                    />
                  </div>
                )}

                {/* Details */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-[10px] font-bold text-dark-500 mb-2 uppercase tracking-widest">Details / Description</label>
                  <input 
                    type="text" 
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Enter details..."
                    className="w-full bg-gold-50 border border-gold-200 rounded-xl px-4 py-2.5 outline-none focus:border-brand-gold focus:bg-white transition-all text-sm font-semibold text-dark-900"
                  />
                </div>

                {/* Amount */}
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-dark-500 mb-2 uppercase tracking-widest">Amount Charged (₹)</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-gold-50 border border-gold-200 rounded-xl px-4 py-2.5 outline-none focus:border-brand-gold focus:bg-white transition-all text-sm font-bold text-dark-900"
                  />
                </div>

                {/* Conditional Cost to Make */}
                {(product === "Frame" || product === "Gift" || product === "Print") ? (
                  <div className="col-span-1 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-[10px] font-bold text-dark-500 mb-2 uppercase tracking-widest">Cost to Make (Expense ₹)</label>
                    <input 
                      type="number" 
                      value={costToMake}
                      onChange={(e) => setCostToMake(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 outline-none focus:border-red-400 focus:bg-white transition-all text-sm font-semibold text-red-900"
                    />
                  </div>
                ) : (
                  <div className="col-span-1"></div>
                )}

                <div className="col-span-1 md:col-span-2 flex justify-end">
                  <button 
                    onClick={addToCart}
                    disabled={!amount}
                    className="flex items-center gap-2 px-8 py-3 bg-dark-900 hover:bg-dark-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors disabled:opacity-50"
                  >
                    <Plus size={16} strokeWidth={2.5} /> Add to Order
                  </button>
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
              className={cn("px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all border shadow-sm", 
                !isOnline ? "bg-brand-gold text-white border-brand-gold" : "bg-white text-dark-500 border-gold-200 hover:border-brand-gold/50"
              )}
            >
              {!isOnline && <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>}
              Offline POS
            </button>
            <button 
              onClick={() => setIsOnline(true)}
              className={cn("px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all border shadow-sm", 
                isOnline ? "bg-green-500 text-white border-green-500" : "bg-white text-dark-500 border-gold-200 hover:border-brand-gold/50"
              )}
            >
              {isOnline && <span className="w-2 h-2 rounded-full bg-white"></span>}
              Online Web
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gold-200 flex flex-col sticky top-6">
            <div className="p-5 border-b border-gold-100 flex items-center justify-between bg-gold-50/50 rounded-t-2xl">
              <h3 className="text-sm font-bold text-dark-900 tracking-widest uppercase flex items-center gap-2">
                <CreditCard className="text-brand-gold" size={18} />
                Checkout
              </h3>
              <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 uppercase tracking-wide",
                isOnline ? "bg-green-50 text-green-600 border-green-200" : "bg-brand-gold/10 text-brand-gold border-brand-gold/20"
              )}>
                {isOnline ? "Online" : "Offline"}
              </div>
            </div>

            <div className="p-5 space-y-5">
              
              <div className="space-y-3 pb-5 border-b border-gold-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-dark-500 font-bold text-[10px] uppercase tracking-widest">Client</span>
                  <span className="font-bold text-dark-900">{customerName || "-"}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-dark-500 font-bold text-[10px] uppercase tracking-widest">Contact</span>
                  <span className="font-bold text-dark-900">{customerPhone || "-"}</span>
                </div>
              </div>

              {/* Cart Items List */}
              <div className="space-y-2 max-h-[300px] overflow-auto pr-1">
                {cart.length === 0 ? (
                  <div className="h-28 flex flex-col items-center justify-center border border-dashed border-gold-300 rounded-xl bg-gold-50">
                    <span className="text-[10px] font-bold text-dark-400 uppercase tracking-widest">Empty Cart</span>
                  </div>
                ) : (
                  cart.map((item, index) => (
                    <div key={item.id} className="bg-gold-50 p-3.5 rounded-xl border border-gold-100 flex justify-between gap-4 group">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-dark-900 text-xs flex items-center gap-2 uppercase tracking-wide">
                          {item.product}
                        </div>
                        {item.details && <div className="text-xs text-dark-600 mt-1 truncate font-medium">{item.details}</div>}
                        {item.idNumber && <div className="text-[9px] font-bold text-brand-gold mt-1.5 bg-brand-gold/10 inline-block px-1.5 py-0.5 rounded uppercase tracking-widest">ID: {item.idNumber}</div>}
                        {item.deliveryDate && <div className="text-[9px] font-bold text-brand-gold mt-1.5 bg-brand-gold/10 inline-block px-1.5 py-0.5 rounded uppercase tracking-widest">Del: {item.deliveryDate}</div>}
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end justify-between">
                        <span className="font-black text-dark-900">₹{item.amount}</span>
                        <button onClick={() => removeFromCart(item.id)} className="text-dark-400 hover:text-red-500 p-1 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-4 pt-5 border-t border-gold-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-dark-500 mb-1.5 uppercase tracking-widest">Payment Status</label>
                    <select 
                      value={amountStatus}
                      onChange={(e) => {
                        setAmountStatus(e.target.value);
                        if (e.target.value === "Completed") setAmountPaid(cartTotal.toString());
                        else if (e.target.value === "Pending") setAmountPaid("0");
                      }}
                      className="w-full bg-gold-50 border border-gold-200 rounded-lg px-2.5 py-2 outline-none focus:border-brand-gold focus:bg-white text-xs font-bold text-dark-900 uppercase tracking-wider"
                    >
                      {AMOUNT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  
                  {amountStatus === "Partial" && (
                    <div className="animate-in fade-in zoom-in-95 duration-200">
                      <label className="block text-[10px] font-bold text-dark-500 mb-1.5 uppercase tracking-widest">Amount Paid (₹)</label>
                      <input 
                        type="number"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-gold-50 border border-gold-200 rounded-lg px-2.5 py-2 outline-none focus:border-brand-gold focus:bg-white text-xs font-bold text-dark-900"
                      />
                    </div>
                  )}

                  <div className={amountStatus !== "Partial" ? "col-span-1" : "col-span-2"}>
                    <label className="block text-[10px] font-bold text-dark-500 mb-1.5 uppercase tracking-widest">Method</label>
                    <select 
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className="w-full bg-gold-50 border border-gold-200 rounded-lg px-2.5 py-2 outline-none focus:border-brand-gold focus:bg-white text-xs font-bold text-dark-900 uppercase tracking-wider"
                    >
                      {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-dark-500 mb-1.5 uppercase tracking-widest">Delivery Status</label>
                    <select 
                      value={deliveryStatus}
                      onChange={(e) => setDeliveryStatus(e.target.value)}
                      className="w-full bg-gold-50 border border-gold-200 rounded-lg px-2.5 py-2 outline-none focus:border-brand-gold focus:bg-white text-xs font-bold text-dark-900 uppercase tracking-wider"
                    >
                      {DELIVERY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-dark-500 mb-1.5 uppercase tracking-widest">Notes</label>
                  <input 
                    type="text" 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Internal notes..."
                    className="w-full bg-gold-50 border border-gold-200 rounded-lg px-3 py-2 outline-none focus:border-brand-gold focus:bg-white text-xs font-medium text-dark-900"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gold-50/80 rounded-b-2xl border-t border-gold-200">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Grand Total</span>
                <span className="text-3xl font-black text-dark-900">₹{cartTotal.toLocaleString()}</span>
              </div>
              
              {amountStatus === "Partial" && (
                <div className="flex justify-between items-end mb-5 pt-3 border-t border-gold-200/60">
                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Remaining Balance</span>
                  <span className="text-lg font-black text-red-600">₹{(cartTotal - (parseFloat(amountPaid) || 0)).toLocaleString()}</span>
                </div>
              )}
              {amountStatus !== "Partial" && <div className="mb-5"></div>}

              <button 
                onClick={handleWhatsApp}
                disabled={cart.length === 0}
                className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl py-3.5 font-bold text-xs uppercase tracking-widest transition-all shadow-sm shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                Send via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
