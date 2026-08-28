"use client";

import { SidebarLayout } from "@/components/SidebarLayout";
import { User, Trash2, Plus, CreditCard, Camera } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PRODUCTS = ["Portrait", "Passport", "Print", "Frame", "Gift", "Photo Shoot"];
const PAYMENT_MODES = ["Cash", "GPay", "Card"];
const DELIVERY_STATUSES = ["Pending", "In Progress", "Delivered"];
const AMOUNT_STATUSES = ["Pending", "Partial", "Completed"];

interface CartItem {
  id: number;
  product: string;
  details: string;
  amount: number;
  idNumber?: string;
  deliveryDate?: string;
}

export default function Home() {
  const params = useParams();
  const branchId = params.branch as string;

  // Global Order State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerDate, setCustomerDate] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  
  useEffect(() => {
    setCustomerDate(new Date().toISOString().split('T')[0]);
  }, []);
  
  // Current Item State
  const [product, setProduct] = useState(PRODUCTS[0]);
  const [idNumber, setIdNumber] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [details, setDetails] = useState("");
  const [amount, setAmount] = useState("");
  
  // Order Level Settings
  const [staffName, setStaffName] = useState("");
  const [amountStatus, setAmountStatus] = useState(AMOUNT_STATUSES[2]);
  const [paymentMode, setPaymentMode] = useState(PAYMENT_MODES[0]);
  const [deliveryStatus, setDeliveryStatus] = useState(DELIVERY_STATUSES[0]);
  const [amountPaid, setAmountPaid] = useState("");
  const [notes, setNotes] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "flat">("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const discountAmt = discountType === "percent"
    ? cartTotal * (parseFloat(discountValue) || 0) / 100
    : parseFloat(discountValue) || 0;
  const finalTotal = Math.max(0, cartTotal - discountAmt);

  const handleSaveOrder = async (sendWhatsApp: boolean) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Generate Sequential Invoice ID (NMG-2026-0001, 0002, ...)
    const year = new Date().getFullYear();
    const prefix = `NMG-${year}-`;

    const getNextInvoiceId = async (): Promise<string> => {
      // Use created_at ordering (more reliable than text-sort on ID)
      const { data: lastOrders } = await supabase
        .from('orders')
        .select('id, created_at')
        .like('id', `${prefix}%`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (lastOrders && lastOrders.length > 0) {
        const lastId = lastOrders[0].id; // e.g. "NMG-2026-0047"
        const lastNum = parseInt(lastId.replace(prefix, ''), 10);
        if (!isNaN(lastNum)) {
          return `${prefix}${String(lastNum + 1).padStart(4, '0')}`;
        }
      }
      return `${prefix}0001`;
    };

    let invoiceId = await getNextInvoiceId().catch(() => {
      // Network fallback — use timestamp suffix to avoid collision
      return `${prefix}${Date.now().toString().slice(-4)}`;
    });
    
    // Save to Supabase
    const amountPaidValue = amountStatus === "Completed" ? finalTotal : (amountStatus === "Partial" ? parseFloat(amountPaid) : 0);
    try {
      let customerId = null;
      if (customerPhone) {
        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('id')
          .eq('phone', customerPhone)
          .eq('branch_id', branchId)
          .maybeSingle();
          
        if (existingCustomer) {
          customerId = existingCustomer.id;
        } else {
          const { data: newCustomer } = await supabase
            .from('customers')
            .insert({
              name: customerName || "Walk-in",
              phone: customerPhone,
              branch_id: branchId
            })
            .select('id')
            .single();
          if (newCustomer) customerId = newCustomer.id;
        }
      }
      
      const newOrder = {
        id: invoiceId,
        branch_id: branchId,
        customer_id: customerId,
        customer_name: customerName || "Walk-in",
        customer_phone: customerPhone || "",
        date: customerDate,
        staff_name: staffName,
        source: isOnline ? "ONLINE" : "OFFLINE",
        total: finalTotal,
        amount_paid: amountPaidValue,
        payment_status: amountStatus === "Pending" ? "Unpaid" : (amountStatus === "Completed" ? "Paid" : "Partial"),
        payment_mode: amountStatus === "Pending" ? "N/A" : paymentMode,
        delivery_status: deliveryStatus,
        discount: discountAmt,
        notes: notes
      };
      
      const { error: orderError } = await supabase.from('orders').insert(newOrder);
      if (orderError) {
        // If duplicate key — refetch and retry once with the correct next number
        if ((orderError as any).code === '23505') {
          invoiceId = await getNextInvoiceId();
          newOrder.id = invoiceId;
          const { error: retryError } = await supabase.from('orders').insert(newOrder);
          if (retryError) throw retryError;
        } else {
          throw orderError;
        }
      }

      if (amountPaidValue > 0) {
        const { error: paymentError } = await supabase.from('payments').insert({
          order_id: invoiceId,
          amount: amountPaidValue,
          payment_mode: amountStatus === "Pending" ? "N/A" : paymentMode
        });
        if (paymentError) throw paymentError;
      }

      const orderItems = cart.map(item => ({
        order_id: invoiceId,
        product: item.product,
        details: item.details,
        amount: item.amount,
        cost_to_make: 0,
        id_number: item.idNumber || null,
        delivery_date: item.deliveryDate || null
      }));
      
      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

    } catch (e) {
      console.error("Supabase Save Error:", e);
      alert("Failed to save to database. Please check console.");
      setIsSubmitting(false);
      return;
    }
    
    if (sendWhatsApp) {
      const target = customerPhone.length === 10 ? customerPhone : "7904199050";
      const cameraEmoji = String.fromCodePoint(0x1F4F8);
      const sparkleEmoji = String.fromCodePoint(0x2728);
      
      let text = `*New Order from NMG Photo Park* ${cameraEmoji}\n\n`;
      text += `Invoice ID: ${invoiceId}\n`;
      if (customerDate) text += `Date: ${customerDate}\n`;
      text += `Customer: ${customerName || 'Walk-in'}\n`;
      text += `Mobile: ${customerPhone || 'N/A'}\n`;
      text += `Staff: ${staffName}\n\n`;
      
      text += `Items:\n`;
      cart.forEach((item, i) => {
        text += `${i+1}. ${item.product} - ₹${item.amount}\n`;
        if (item.details) text += `   └ Details: ${item.details}\n`;
        if (item.deliveryDate) text += `   └ Delivery Date: ${item.deliveryDate}\n`;
        if (item.idNumber) text += `   └ ID: ${item.idNumber}\n`;
      });
      
      text += `\nTotal Amount: ₹${finalTotal.toLocaleString()}\n`;
      text += `Advance Paid: ${amountPaidValue}\n`;
      const balance = Math.max(0, finalTotal - amountPaidValue);
      text += `*Balance Payment:*${balance}\n\n`;
      
      text += `Delivery Status: ${deliveryStatus}\n`;
      if (notes) text += `Notes: ${notes}\n`;
      
      const invoiceUrl = `${window.location.origin}/invoice/${invoiceId}`;
      text += `\nView Invoice: ${invoiceUrl}\n`;
      text += `\nThank you for choosing us! ${sparkleEmoji}`;

      const encodedMessage = encodeURIComponent(text);
      window.open(`https://api.whatsapp.com/send/?phone=91${target}&text=${encodedMessage}`, "_blank");
    }
    
    // Clear order for the next customer
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setStaffName("");
    setCustomerDate(new Date().toISOString().split('T')[0]);
    setAmountPaid("");
    setNotes("");
    setDiscountValue("");
    setIsSubmitting(false);
  };
  
  return (
    <SidebarLayout>
      <div className="flex flex-col lg:flex-row gap-6 h-full pb-10">
        
        {/* Left Side (Customer & Items) */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-dark-900 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-gray-900 rounded-full inline-block"></span>
                Billing Station
              </h2>
              <p className="text-sm text-dark-500 mt-1 pl-3.5 font-medium">Create orders & sync database</p>
            </div>
            
            {/* Mobile Toggle */}
            <div className="lg:hidden flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200" onClick={() => setIsOnline(!isOnline)}>
              <span className="text-[10px] font-bold text-dark-600 uppercase tracking-widest">Offline</span>
              <div className={cn("w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors relative", isOnline ? 'bg-green-500' : 'bg-gray-800')}>
                <div className={cn("w-4 h-4 bg-white rounded-full transition-transform absolute top-0.5", isOnline ? 'translate-x-5' : 'translate-x-0')}></div>
              </div>
              <span className="text-[10px] font-bold text-dark-600 uppercase tracking-widest">Online</span>
            </div>
          </div>

          {/* Main Left Form Box */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex-1 flex flex-col gap-8">
            
            {/* Customer Details Section */}
            <div>
              <h3 className="text-sm font-bold text-dark-900 mb-5 tracking-widest uppercase flex items-center gap-2">
                <User className="text-gray-700" size={18} />
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
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-gray-400 focus:bg-white transition-all text-sm font-semibold text-dark-900 placeholder-dark-400"
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
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-gray-400 focus:bg-white transition-all text-sm font-semibold text-dark-900 placeholder-dark-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-dark-500 mb-2 uppercase tracking-widest">Date</label>
                  <input 
                    type="date"
                    value={customerDate}
                    onChange={(e) => setCustomerDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-gray-400 focus:bg-white transition-all text-sm font-semibold text-dark-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-dark-500 mb-2 uppercase tracking-widest">Handled By (Staff)</label>
                  <input 
                    type="text"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    placeholder="Staff name"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-gray-400 focus:bg-white transition-all text-sm font-semibold text-dark-900 placeholder-dark-400"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100"></div>

            {/* Product Form Section */}
            <div>
              <h3 className="text-sm font-bold text-dark-900 mb-6 tracking-widest uppercase flex items-center gap-2">
                <Camera className="text-gray-700" size={18} />
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
                          type="button"
                          onClick={() => setProduct(p)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border",
                            product === p 
                              ? "bg-dark-900 text-white border-dark-900 shadow-sm" 
                              : "bg-white text-dark-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
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
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-gray-400 focus:bg-white transition-all text-sm font-semibold text-dark-900"
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
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-gray-400 focus:bg-white transition-all text-sm font-semibold text-dark-900"
                      />
                    </div>
                  )}

                  {/* Details */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-[10px] font-bold text-dark-500 mb-2 uppercase tracking-widest">Details / Description</label>
                    <textarea 
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder="Enter details..."
                      rows={2}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-gray-400 focus:bg-white transition-all text-sm font-semibold text-dark-900 resize-none"
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
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-gray-400 focus:bg-white transition-all text-sm font-bold text-dark-900"
                    />
                  </div>

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
        </div>

        {/* Right Side (Summary) */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6">
          
          {/* Status Pills */}
          <div className="flex justify-end hidden lg:flex">
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 cursor-pointer hover:border-gray-400 transition-colors" onClick={() => setIsOnline(!isOnline)}>
              <span className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors", !isOnline ? "text-gray-800" : "text-dark-400")}>Offline</span>
              <div className={cn("w-12 h-6 rounded-full p-0.5 transition-colors relative", isOnline ? 'bg-green-500' : 'bg-gray-800')}>
                <div className={cn("w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 shadow-sm", isOnline ? 'translate-x-6' : 'translate-x-0')}></div>
              </div>
              <span className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors", isOnline ? "text-green-500" : "text-dark-400")}>Online</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col sticky top-6">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80 rounded-t-2xl">
              <h3 className="text-sm font-bold text-dark-900 tracking-widest uppercase flex items-center gap-2">
                <CreditCard className="text-gray-700" size={18} />
                Checkout
              </h3>
              <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 uppercase tracking-wide",
                isOnline ? "bg-green-50 text-green-600 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"
              )}>
                {isOnline ? "Online" : "Offline"}
              </div>
            </div>

            <div className="p-5 space-y-5">
              
              <div className="space-y-3 pb-5 border-b border-gray-100">
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
                  <div className="h-28 flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-xl bg-gray-50">
                    <span className="text-[10px] font-bold text-dark-400 uppercase tracking-widest">Empty Cart</span>
                  </div>
                ) : (
                  cart.map((item, index) => (
                    <div key={item.id} className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 flex justify-between gap-4 group">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-dark-900 text-xs flex items-center gap-2 uppercase tracking-wide">
                          {item.product}
                        </div>
                        {item.details && <div className="text-xs text-dark-600 mt-1 truncate font-medium">{item.details}</div>}
                        {item.idNumber && <div className="text-[9px] font-bold text-gray-800 mt-1.5 bg-gray-200 inline-block px-1.5 py-0.5 rounded uppercase tracking-widest">ID: {item.idNumber}</div>}
                        {item.deliveryDate && <div className="text-[9px] font-bold text-gray-800 mt-1.5 bg-gray-200 inline-block px-1.5 py-0.5 rounded uppercase tracking-widest">Del: {item.deliveryDate}</div>}
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

              <div className="space-y-4 pt-5 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-dark-500 mb-1.5 uppercase tracking-widest">Payment Status</label>
                    <select 
                      value={amountStatus}
                      onChange={(e) => {
                        setAmountStatus(e.target.value);
                        // Update amountPaid when status changes  
              if (e.target.value === "Completed") setAmountPaid(finalTotal.toString());
              else if (e.target.value === "Pending") setAmountPaid("0");
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 outline-none focus:border-gray-400 focus:bg-white text-xs font-bold text-dark-900 uppercase tracking-wider"
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
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 outline-none focus:border-gray-400 focus:bg-white text-xs font-bold text-dark-900"
                      />
                    </div>
                  )}

                  <div className={amountStatus !== "Partial" ? "col-span-1" : "col-span-2"}>
                    <label className="block text-[10px] font-bold text-dark-500 mb-1.5 uppercase tracking-widest">Method</label>
                    <select 
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      disabled={amountStatus === "Pending"}
                      className={cn(
                        "w-full rounded-lg px-2.5 py-2 outline-none text-xs font-bold uppercase tracking-wider transition-all",
                        amountStatus === "Pending" 
                          ? "bg-gray-100 border border-gray-200 text-dark-400 cursor-not-allowed opacity-60" 
                          : "bg-gray-50 border border-gray-200 focus:border-gray-400 focus:bg-white text-dark-900"
                      )}
                    >
                      {amountStatus === "Pending" ? (
                        <option value="N/A">N/A</option>
                      ) : (
                        PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)
                      )}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-dark-500 mb-1.5 uppercase tracking-widest">Delivery Status</label>
                    <select 
                      value={deliveryStatus}
                      onChange={(e) => setDeliveryStatus(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 outline-none focus:border-gray-400 focus:bg-white text-xs font-bold text-dark-900 uppercase tracking-wider"
                    >
                      {DELIVERY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-dark-500 mb-1.5 uppercase tracking-widest">Notes</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Internal notes..."
                    rows={2}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-400 focus:bg-white text-xs font-medium text-dark-900 resize-none"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50/80 rounded-b-2xl border-t border-gray-200">
              {/* Discount inputs */}
              <div className="flex items-center gap-2 mb-4">
                <label className="text-[10px] font-bold text-dark-500 uppercase tracking-widest whitespace-nowrap">Discount</label>
                
                <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden shrink-0">
                  <button
                    onClick={() => { setDiscountType("percent"); setDiscountValue(""); }}
                    className={cn(
                      "px-3 py-1.5 text-xs font-bold transition-colors",
                      discountType === "percent" ? "bg-dark-900 text-white" : "text-dark-500 hover:bg-gray-100"
                    )}
                  >
                    %
                  </button>
                  <button
                    onClick={() => { setDiscountType("flat"); setDiscountValue(""); }}
                    className={cn(
                      "px-3 py-1.5 text-xs font-bold transition-colors",
                      discountType === "flat" ? "bg-dark-900 text-white" : "text-dark-500 hover:bg-gray-100"
                    )}
                  >
                    ₹
                  </button>
                </div>

                <div className="relative flex-1 max-w-[100px]">
                  <input
                    type="number"
                    min="0"
                    max={discountType === "percent" ? "100" : undefined}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="0"
                    className="w-full bg-white border border-gray-200 focus:border-gray-400 rounded-lg px-3 py-1.5 text-xs font-bold text-dark-900 outline-none transition-colors"
                  />
                </div>

                {discountAmt > 0 && (
                  <span className="text-xs font-bold text-red-500 ml-auto">-₹{discountAmt.toLocaleString()}</span>
                )}
              </div>

              {discountAmt > 0 && (
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-dark-400 font-bold uppercase tracking-widest">Subtotal</span>
                  <span className="font-bold text-dark-600 line-through">₹{cartTotal.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Grand Total</span>
                <span className="text-3xl font-black text-dark-900">₹{finalTotal.toLocaleString()}</span>
              </div>
              
              {amountStatus === "Partial" && (
                <div className="flex justify-between items-end mb-5 pt-3 border-t border-gray-200/60">
                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Remaining Balance</span>
                  <span className="text-lg font-black text-red-600">₹{(finalTotal - (parseFloat(amountPaid) || 0)).toLocaleString()}</span>
                </div>
              )}
              {amountStatus !== "Partial" && <div className="mb-5"></div>}

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => handleSaveOrder(false)}
                  disabled={cart.length === 0 || isSubmitting}
                  className="w-full bg-dark-900 hover:bg-dark-800 text-white rounded-xl py-3.5 font-bold text-xs uppercase tracking-widest transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Only"
                  )}
                </button>

                <button 
                  onClick={() => handleSaveOrder(true)}
                  disabled={cart.length === 0 || isSubmitting}
                  className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl py-3.5 font-bold text-xs uppercase tracking-widest transition-all shadow-sm shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    "Save & WhatsApp"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
