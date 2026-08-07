"use client";

import { SidebarLayout } from "@/components/SidebarLayout";
import { Search, Download, X, Lock, CheckCircle2, CreditCard, Banknote, Truck, ExternalLink, Printer } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Link from "next/link";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Order {
  id: string;
  customer: string;
  phone: string;
  source: string;
  total: number;
  amountPaid: number;
  status: string; // "Paid", "Unpaid", "Partial", "Pending"
  product: string;
  date: string; // YYYY-MM-DD
  paymentMode: string;
  deliveryStatus: string; // "Pending", "Processing", "Ready", "Delivered"
  details: string;
  idNumber: string;
  statusLocked?: boolean;
}

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getThisWeekRange(): { start: string; end: string } {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const format = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const date = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${date}`;
  };

  return { start: format(monday), end: format(sunday) };
}

function getThisMonthRange(): { start: string; end: string } {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const format = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const date = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${date}`;
  };

  return { start: format(firstDay), end: format(lastDay) };
}

function getThisYearRange(): { start: string; end: string } {
  const now = new Date();
  const year = now.getFullYear();
  return { start: `${year}-01-01`, end: `${year}-12-31` };
}

export default function HistoryPage() {
  const params = useParams();
  const branchId = params.branch as string;
  const [orders, setOrders] = useState<Order[]>([]);
  const [period, setPeriod] = useState<string>("ALL TIME");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [globalSearch, setGlobalSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL STATUS");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderExpenses, setOrderExpenses] = useState<any[]>([]);
  const [orderPayments, setOrderPayments] = useState<any[]>([]);
  const [updateFeedback, setUpdateFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Partial Payment Modal State
  const [paymentModalOrder, setPaymentModalOrder] = useState<Order | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [recordingPayment, setRecordingPayment] = useState(false);

  useEffect(() => {
    async function fetchOrders() {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('branch_id', branchId)
        .order('created_at', { ascending: false });

      if (data && !error) {
        const mappedOrders: Order[] = data.map((o: any) => ({
          id: o.id,
          customer: o.customer_name || 'Walk-in',
          phone: o.customer_phone || '',
          source: o.source,
          total: o.total,
          amountPaid: o.amount_paid || 0,
          status: o.payment_status || 'Unpaid',
          product: o.order_items?.map((i: any) => i.product).join(', ') || '',
          date: o.date,
          paymentMode: o.payment_mode || 'Cash',
          deliveryStatus: o.delivery_status || 'Pending',
          details: o.order_items?.map((i: any) => i.details).join(', ') || '',
          idNumber: o.order_items?.[0]?.id_number || '',
          statusLocked: o.status_locked
        }));
        setOrders(mappedOrders);
      }
      setLoading(false);
    }
    fetchOrders();
  }, [branchId]);

  useEffect(() => {
    async function fetchOrderDetails() {
      if (selectedOrder) {
        // Fetch expenses
        const { data: expData } = await supabase
          .from('expenses')
          .select('*')
          .ilike('notes', `%Order ID: ${selectedOrder.id}%`);
        setOrderExpenses(expData || []);

        // Fetch payment history
        const { data: payData } = await supabase
          .from('payments')
          .select('*')
          .eq('order_id', selectedOrder.id)
          .order('recorded_at', { ascending: true });
        setOrderPayments(payData || []);
      } else {
        setOrderExpenses([]);
        setOrderPayments([]);
      }
    }
    fetchOrderDetails();
  }, [selectedOrder]);

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    if (newPeriod === "ALL TIME") {
      setFromDate("");
      setToDate("");
    } else if (newPeriod === "TODAY") {
      const today = getTodayString();
      setFromDate(today);
      setToDate(today);
    } else if (newPeriod === "THIS WEEK") {
      const { start, end } = getThisWeekRange();
      setFromDate(start);
      setToDate(end);
    } else if (newPeriod === "THIS MONTH") {
      const { start, end } = getThisMonthRange();
      setFromDate(start);
      setToDate(end);
    } else if (newPeriod === "THIS YEAR") {
      const { start, end } = getThisYearRange();
      setFromDate(start);
      setToDate(end);
    }
  };

  // Update Delivery Status
  const handleDeliveryStatusUpdate = async (orderId: string, newDeliveryStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ delivery_status: newDeliveryStatus })
      .eq('id', orderId);

    if (error) {
      console.error("Failed to update delivery status:", error);
      alert("Failed to update delivery status.");
      return;
    }

    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          deliveryStatus: newDeliveryStatus,
        };
      }
      return o;
    });

    setOrders(updated);

    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({
        ...selectedOrder,
        deliveryStatus: newDeliveryStatus,
      });
    }

    setUpdateFeedback(`Order ${orderId} delivery status updated to "${newDeliveryStatus}".`);
    setTimeout(() => setUpdateFeedback(null), 3500);
  };

  // Open Payment Prompt for Partial/Unpaid orders
  const openPaymentModal = (order: Order) => {
    setPaymentModalOrder(order);
    const restToPay = order.total - order.amountPaid;
    setPaymentAmount(restToPay.toString());
    setPaymentMode("Cash");
  };

  // Submit Payment Record
  const handleConfirmPayment = async () => {
    if (!paymentModalOrder || !paymentAmount) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;

    const restToPay = paymentModalOrder.total - paymentModalOrder.amountPaid;
    if (amount > restToPay) {
      alert(`Amount cannot exceed the remaining balance of ₹${restToPay.toLocaleString()}`);
      return;
    }

    setRecordingPayment(true);
    const newAmountPaid = paymentModalOrder.amountPaid + amount;
    const newStatus = newAmountPaid >= paymentModalOrder.total ? "Paid" : "Partial";
    const statusLocked = newStatus === "Paid";

    // Determine payment mode
    const { data: existingPayData } = await supabase
      .from('payments')
      .select('payment_mode')
      .eq('order_id', paymentModalOrder.id);
    
    const existingModes = (existingPayData || []).map(p => p.payment_mode);
    const allModes = [...new Set([...existingModes, paymentMode])];
    const finalMode = allModes.length > 1 ? "Mixed" : paymentMode;

    // Record in payments table
    await supabase
      .from('payments')
      .insert({ order_id: paymentModalOrder.id, amount, payment_mode: paymentMode });

    // Update order totals
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        amount_paid: newAmountPaid,
        payment_status: newStatus,
        payment_mode: finalMode,
        status_locked: statusLocked
      })
      .eq('id', paymentModalOrder.id);

    if (orderError) {
      alert("Failed to update order status.");
    } else {
      const updatedOrder = {
        ...paymentModalOrder,
        amountPaid: newAmountPaid,
        status: newStatus,
        paymentMode: finalMode,
        statusLocked
      };

      setOrders(orders.map(o => o.id === paymentModalOrder.id ? updatedOrder : o));

      if (selectedOrder && selectedOrder.id === paymentModalOrder.id) {
        setSelectedOrder(updatedOrder);
        setOrderPayments(prev => [...prev, {
          id: Date.now(),
          order_id: paymentModalOrder.id,
          amount,
          payment_mode: paymentMode,
          recorded_at: new Date().toISOString()
        }]);
      }

      setUpdateFeedback(`✓ Payment of ₹${amount.toLocaleString()} recorded via ${paymentMode} for Order ${paymentModalOrder.id}.`);
      setTimeout(() => setUpdateFeedback(null), 4000);
      setPaymentModalOrder(null);
    }

    setRecordingPayment(false);
  };

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      alert("No orders available to export.");
      return;
    }

    const headers = [
      "Order ID",
      "Date",
      "Customer",
      "Phone",
      "Source",
      "Product",
      "Total (INR)",
      "Amount Paid (INR)",
      "Rest to Pay (INR)",
      "Payment Status",
      "Payment Mode",
      "Delivery Status",
      "Details"
    ];

    const rows = filteredOrders.map(o => [
      `"${o.id}"`,
      `"${o.date}"`,
      `"${(o.customer || "").replace(/"/g, '""')}"`,
      `"${o.phone || ""}"`,
      `"${o.source || ""}"`,
      `"${(o.product || "").replace(/"/g, '""')}"`,
      o.total,
      o.amountPaid,
      o.total - o.amountPaid,
      `"${o.status}"`,
      `"${o.paymentMode || ""}"`,
      `"${o.deliveryStatus || ""}"`,
      `"${(o.details || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `nmg_orders_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Global Search Filter
      const matchesSearch =
        order.id.toLowerCase().includes(globalSearch.toLowerCase()) ||
        order.customer.toLowerCase().includes(globalSearch.toLowerCase()) ||
        order.phone.includes(globalSearch) ||
        order.product.toLowerCase().includes(globalSearch.toLowerCase());

      // Status Filter
      const matchesStatus =
        statusFilter === "ALL STATUS" || order.status.toUpperCase() === statusFilter;

      // Date Filtering
      let matchesDate = true;
      if (fromDate && order.date < fromDate) matchesDate = false;
      if (toDate && order.date > toDate) matchesDate = false;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, globalSearch, statusFilter, fromDate, toDate]);

  return (
    <SidebarLayout>
      <div className="flex flex-col gap-4 sm:gap-5">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-dark-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-brand-gold rounded-full inline-block"></span>
              Order History
            </h2>
            <p className="text-sm text-dark-500 mt-1 pl-3.5 font-medium">Manage and track past invoices for NMG PhotoShop</p>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <div className="flex flex-wrap items-center justify-end gap-2 w-full">
              
              {/* Date Pickers */}
              <div className="flex items-center gap-2 bg-white border border-gold-200 rounded-full px-4 py-1.5 shadow-sm">
                <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">From</span>
                <input 
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPeriod("CUSTOM");
                  }}
                  className="text-xs font-bold text-dark-900 bg-transparent outline-none cursor-pointer"
                />

                <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest ml-2">To</span>
                <input 
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPeriod("CUSTOM");
                  }}
                  className="text-xs font-bold text-dark-900 bg-transparent outline-none cursor-pointer"
                />
              </div>

              {/* Period Buttons */}
              <div className="flex items-center bg-white rounded-full p-1 border border-gold-200 shadow-sm">
                <span className="text-[10px] font-bold text-dark-500 px-3 uppercase tracking-widest hidden sm:inline">Period</span>
                {["ALL TIME", "TODAY", "THIS WEEK", "THIS MONTH", "THIS YEAR"].map(p => (
                  <button 
                    key={p}
                    onClick={() => handlePeriodChange(p)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-[10px] font-bold transition-all uppercase tracking-widest",
                      period === p ? "bg-brand-gold text-white shadow-sm" : "text-dark-600 hover:bg-gold-50"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>

            </div>

            {/* Export CSV Button */}
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-5 py-2 bg-white hover:bg-gold-50 text-dark-900 border border-gold-200 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors shadow-sm cursor-pointer"
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {updateFeedback && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            {updateFeedback}
          </div>
        )}

        {/* Global Search & Filter */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gold-200 flex flex-wrap gap-4 items-center">
          <div className="flex-1 w-full md:w-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold" size={18} />
            <input 
              type="text" 
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search by Order ID, Customer Name, Phone, or Product..." 
              className="w-full bg-gold-50 border border-gold-200 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-brand-gold focus:bg-white text-sm font-medium text-dark-900 placeholder-dark-400 transition-colors" 
            />
          </div>
          <div className="w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-48 bg-gold-50 border border-gold-200 rounded-xl px-4 py-3 outline-none focus:border-brand-gold focus:bg-white text-xs font-bold text-dark-900 uppercase tracking-widest transition-colors cursor-pointer"
            >
              <option value="ALL STATUS">All Status</option>
              <option value="PAID">Paid (Completed)</option>
              <option value="PARTIAL">Partial</option>
              <option value="UNPAID">Unpaid (Pending)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gold-200 overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gold-50/50 border-b border-gold-200">
                  <th className="px-6 py-4 text-[10px] font-bold text-dark-500 uppercase tracking-widest">Date / Order ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-dark-500 uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-dark-500 uppercase tracking-widest">Product</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-dark-500 uppercase tracking-widest">Total / Rest</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-dark-500 uppercase tracking-widest">Payment Mode & Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-dark-500 uppercase tracking-widest">Delivery Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-dark-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-100">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const isEditable = !order.statusLocked && (order.status === "Unpaid" || order.status === "Pending" || order.status === "Partial");
                    const restToPay = Math.max(0, order.total - order.amountPaid);
                    
                    return (
                      <tr key={order.id} className="hover:bg-gold-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-[10px] font-bold text-dark-400 mb-1 tracking-widest">{order.date}</div>
                          <span className="text-sm font-bold text-dark-900">{order.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-dark-900 block">{order.customer}</span>
                          <span className="text-[10px] font-bold text-dark-400 tracking-widest">{order.phone}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-dark-900 uppercase">{order.product}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-black text-dark-900">₹{order.total.toLocaleString()}</div>
                          {restToPay > 0 ? (
                            <div className="text-[10px] font-bold text-red-600">Rest: ₹{restToPay.toLocaleString()}</div>
                          ) : (
                            <div className="text-[10px] font-bold text-emerald-600">Paid in full</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-gold-100 text-dark-900 border border-gold-200 flex items-center gap-1">
                              <Banknote size={12} className="text-brand-gold" />
                              {order.paymentMode || 'Cash'}
                            </span>
                            <span className={cn("text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1",
                              order.status === "Paid" ? "bg-emerald-100 text-emerald-800" :
                              order.status === "Unpaid" || order.status === "Pending" ? "bg-red-100 text-red-800" :
                              "bg-amber-100 text-amber-800"
                            )}>
                              {order.status}
                              {order.statusLocked && <Lock size={10} className="inline ml-0.5 text-dark-500" />}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={order.deliveryStatus || 'Pending'}
                            onChange={(e) => handleDeliveryStatusUpdate(order.id, e.target.value)}
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer transition-colors",
                              order.deliveryStatus === "Delivered" ? "bg-emerald-50 text-emerald-800 border-emerald-300" :
                              order.deliveryStatus === "Ready" ? "bg-blue-50 text-blue-800 border-blue-300" :
                              order.deliveryStatus === "Processing" ? "bg-purple-50 text-purple-800 border-purple-300" :
                              "bg-gold-50 text-dark-700 border-gold-200"
                            )}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Ready">Ready for Pickup</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            {isEditable && (
                              <button
                                onClick={() => openPaymentModal(order)}
                                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 shadow-sm transition-colors cursor-pointer"
                              >
                                <CreditCard size={12} />
                                Record Pay
                              </button>
                            )}

                            <button 
                              onClick={() => setSelectedOrder(order)}
                              className="text-[10px] font-bold text-brand-gold hover:text-dark-900 uppercase tracking-widest transition-colors ml-1"
                            >
                              Details →
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-dark-400 font-bold text-[10px] tracking-widest uppercase">
                      No orders found matching the filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Partial Payment Record Modal */}
      {paymentModalOrder && (
        <div className="fixed inset-0 bg-dark-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gold-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gold-100 bg-gold-50/50">
              <h3 className="text-sm font-bold text-dark-900 tracking-widest uppercase flex items-center gap-2">
                <Banknote className="text-emerald-600" size={18} />
                Record Partial / Full Payment
              </h3>
              <button 
                onClick={() => setPaymentModalOrder(null)}
                className="text-dark-400 hover:text-dark-900 transition-colors p-1"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-gold-50 rounded-xl p-3.5 border border-gold-200 space-y-1">
                <div className="text-xs font-bold text-dark-900">{paymentModalOrder.id} • {paymentModalOrder.customer}</div>
                <div className="flex justify-between text-xs text-dark-600">
                  <span>Total Amount: <strong>₹{paymentModalOrder.total.toLocaleString()}</strong></span>
                  <span>Already Paid: <strong className="text-emerald-700">₹{paymentModalOrder.amountPaid.toLocaleString()}</strong></span>
                </div>
                <div className="text-xs font-black text-red-600 pt-1 border-t border-gold-200 mt-1">
                  Remaining Balance: ₹{(paymentModalOrder.total - paymentModalOrder.amountPaid).toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-dark-500 uppercase tracking-widest mb-1.5">
                  Payment Amount (₹) <span className="text-red-500">*</span>
                </label>
                {paymentModalOrder.status === "Partial" ? (
                  <div className="w-full bg-gold-50/50 border border-gold-200 rounded-xl px-4 py-2.5 text-base font-black text-dark-400 cursor-not-allowed">
                    ₹{paymentModalOrder.total - paymentModalOrder.amountPaid} (Final Balance)
                  </div>
                ) : (
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      const restToPay = paymentModalOrder.total - paymentModalOrder.amountPaid;
                      if (!isNaN(val) && val > restToPay) {
                        setPaymentAmount(restToPay.toString());
                      } else {
                        setPaymentAmount(e.target.value);
                      }
                    }}
                    placeholder={`Max ₹${paymentModalOrder.total - paymentModalOrder.amountPaid}`}
                    className="w-full bg-gold-50 border border-gold-200 focus:border-brand-gold rounded-xl px-4 py-2.5 text-base font-black text-dark-900 outline-none transition-colors"
                  />
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-dark-500 uppercase tracking-widest mb-1.5">
                  Select Payment Mode <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["Cash", "GPay", "Card"].map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMode(mode)}
                      className={cn(
                        "py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all border text-center cursor-pointer",
                        paymentMode === mode 
                          ? "bg-dark-900 text-white border-dark-900 shadow-sm scale-[1.02]" 
                          : "bg-white text-dark-700 border-gold-200 hover:bg-gold-50"
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalOrder(null)}
                  className="px-4 py-2 bg-gold-100 hover:bg-gold-200 text-dark-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={recordingPayment || !paymentAmount}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 size={15} />
                  {recordingPayment ? "Saving..." : "Confirm Payment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-dark-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gold-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-gold-100 bg-gold-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-dark-900 tracking-widest uppercase flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-brand-gold rounded-full"></span>
                  Order Details
                </h3>
                <Link
                  href={`/invoice/${selectedOrder.id}`}
                  target="_blank"
                  className="text-[10px] font-bold text-brand-gold hover:text-dark-900 uppercase tracking-widest flex items-center gap-1 bg-gold-100/80 px-2.5 py-1 rounded-full border border-gold-200 transition-colors"
                >
                  Print Invoice <ExternalLink size={11} />
                </Link>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-dark-400 hover:text-dark-900 transition-colors p-1"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>
            
            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="flex justify-between items-start pb-4 border-b border-gold-100">
                <div>
                  <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-1">Order ID</div>
                  <div className="font-bold text-dark-900 text-sm">{selectedOrder.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-1">Date</div>
                  <div className="font-bold text-dark-900 text-sm">{selectedOrder.date}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gold-100">
                <div>
                  <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-1">Customer</div>
                  <div className="font-bold text-dark-900 text-sm">{selectedOrder.customer}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-1">Phone</div>
                  <div className="font-bold text-dark-900 text-sm">{selectedOrder.phone}</div>
                </div>
              </div>

              <div className="bg-gold-50 rounded-xl p-4 border border-gold-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-1">Product</div>
                    <div className="font-bold text-brand-gold uppercase text-sm">{selectedOrder.product}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-1">Total Amount</div>
                    <div className="font-black text-dark-900 text-lg">₹{selectedOrder.total.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-1">Amount Paid</div>
                    <div className="font-black text-emerald-600 text-lg">₹{selectedOrder.amountPaid.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-1">Rest to Pay</div>
                    <div className="font-black text-red-600 text-lg">₹{Math.max(0, selectedOrder.total - selectedOrder.amountPaid).toLocaleString()}</div>
                  </div>
                  <div className="col-span-2 md:col-span-4">
                    <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-1">Details</div>
                    <div className="font-medium text-dark-900 text-sm">{selectedOrder.details || "-"}</div>
                  </div>
                  {selectedOrder.idNumber && (
                    <div className="col-span-2 md:col-span-4 pt-1">
                      <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-1">ID Number</div>
                      <div className="font-bold text-dark-900 text-sm">{selectedOrder.idNumber}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Controls */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gold-100">
                <div>
                  <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-1.5">Payment Status</div>
                  <div className="font-extrabold text-xs uppercase flex items-center gap-1.5">
                    <span className={cn("px-2.5 py-1 rounded-md text-[10px]",
                      selectedOrder.status === "Paid" ? "bg-emerald-100 text-emerald-800" :
                      selectedOrder.status === "Partial" ? "bg-amber-100 text-amber-800" :
                      "bg-red-100 text-red-800"
                    )}>
                      {selectedOrder.status}
                    </span>
                    {selectedOrder.statusLocked && <Lock size={12} className="text-dark-400" />}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-1.5">Delivery Status</div>
                  <select
                    value={selectedOrder.deliveryStatus || 'Pending'}
                    onChange={(e) => handleDeliveryStatusUpdate(selectedOrder.id, e.target.value)}
                    className="w-full text-xs font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border border-gold-300 bg-gold-50 text-dark-900 focus:outline-none cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Ready">Ready for Pickup</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>

              {/* Payment Ledger Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest flex items-center gap-1.5">
                    <Banknote size={14} />
                    Payment History Breakdown
                  </div>
                  {selectedOrder.status !== "Paid" && (
                    <button
                      onClick={() => openPaymentModal(selectedOrder)}
                      className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 uppercase tracking-widest flex items-center gap-1"
                    >
                      + Add Payment
                    </button>
                  )}
                </div>

                {(() => {
                  let totalRecorded = orderPayments.reduce((acc, p) => acc + parseFloat(p.amount || 0), 0);
                  let displayPayments = [...orderPayments];
                  
                  if (totalRecorded < selectedOrder.amountPaid) {
                     displayPayments.unshift({
                        id: 'legacy-first',
                        amount: selectedOrder.amountPaid - totalRecorded,
                        payment_mode: selectedOrder.paymentMode === 'Mixed' ? 'Cash' : selectedOrder.paymentMode,
                        recorded_at: selectedOrder.date
                     });
                  }

                  return displayPayments.length > 0 ? (
                    <div className="space-y-2">
                      {displayPayments.map((p: any, idx: number) => (
                        <div key={p.id || idx} className="flex justify-between items-center text-xs bg-emerald-50/70 border border-emerald-100 rounded-xl px-3.5 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-emerald-900 uppercase tracking-wider">
                              {idx === 0 ? "First Time" : idx === 1 ? "Second Time" : `Payment #${idx + 1}`}: {p.payment_mode || 'Cash'}
                            </span>
                            <span className="text-dark-400">•</span>
                            <span className="text-dark-500 font-medium">
                              {new Date(p.recorded_at).toLocaleDateString('en-IN', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <span className="font-black text-emerald-700 text-sm">+₹{parseFloat(p.amount).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-dark-400 font-medium italic py-2">
                      No payments recorded yet.
                    </div>
                  );
                })()}
              </div>

              {/* Expenses linked to order */}
              {orderExpenses.length > 0 && (
                <div className="pt-2 border-t border-gold-100">
                  <div className="text-[10px] font-bold text-brand-gold uppercase tracking-widest mb-2">Order Expenses</div>
                  <div className="space-y-2">
                    {orderExpenses.map((exp: any) => (
                      <div key={exp.id} className="flex justify-between items-center text-sm p-3 bg-red-50/50 rounded-lg border border-red-100">
                        <div>
                          <div className="font-bold text-dark-900">{exp.category}</div>
                          <div className="text-xs text-dark-500">{exp.date} • {exp.payment_mode}</div>
                        </div>
                        <div className="font-black text-red-600">-₹{exp.amount}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </SidebarLayout>
  );
}
