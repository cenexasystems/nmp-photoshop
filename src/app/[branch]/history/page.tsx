"use client";

import { SidebarLayout } from "@/components/SidebarLayout";
import { Search, Download, X, Lock, CheckCircle2, CreditCard, Banknote, Truck, ExternalLink, Printer, MessageCircle, Trash2 } from "lucide-react";
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
  discount: number;
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
  const [deliveryFilter, setDeliveryFilter] = useState<string>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderExpenses, setOrderExpenses] = useState<any[]>([]);
  const [orderPayments, setOrderPayments] = useState<any[]>([]);
  const [updateFeedback, setUpdateFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Partial Payment Modal State
  const [paymentModalOrder, setPaymentModalOrder] = useState<Order | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [discountWriteoff, setDiscountWriteoff] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [isSplitRecord, setIsSplitRecord] = useState(false);
  const [splitCashRecord, setSplitCashRecord] = useState("");
  const [splitGpayRecord, setSplitGpayRecord] = useState("");
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
          discount: o.discount || 0,
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
    setDiscountWriteoff("");
    setPaymentMode("Cash");
    setIsSplitRecord(false);
    setSplitCashRecord("");
    setSplitGpayRecord("");
  };

  // Submit Payment Record
  const handleConfirmPayment = async () => {
    if (!paymentModalOrder) return;
    const amount = parseFloat(paymentAmount) || 0;
    const writeoff = parseFloat(discountWriteoff) || 0;

    if (amount <= 0 && writeoff <= 0) return;

    const restToPay = paymentModalOrder.total - paymentModalOrder.amountPaid;
    const totalCredit = amount + writeoff;
    
    if (totalCredit > restToPay) {
      alert(`Payment + Discount (₹${totalCredit}) cannot exceed remaining balance of ₹${restToPay.toLocaleString()}`);
      return;
    }

    setRecordingPayment(true);
    const newAmountPaid = paymentModalOrder.amountPaid + amount;
    const newDiscount = paymentModalOrder.discount + writeoff;
    const finalTotal = paymentModalOrder.total - writeoff;
    
    const newStatus = newAmountPaid >= finalTotal ? "Paid" : "Partial";
    const statusLocked = newStatus === "Paid";

    // Determine payment mode for the order record
    const splitCashAmt = isSplitRecord ? (parseFloat(splitCashRecord) || 0) : 0;
    const splitGpayAmt = isSplitRecord ? (parseFloat(splitGpayRecord) || 0) : 0;

    const { data: existingPayData } = await supabase
      .from('payments')
      .select('payment_mode')
      .eq('order_id', paymentModalOrder.id);
    
    const existingModes = (existingPayData || []).map(p => p.payment_mode).filter(m => m !== "N/A");
    const newModes = isSplitRecord
      ? (splitCashAmt > 0 ? ["Cash"] : []).concat(splitGpayAmt > 0 ? ["GPay"] : [])
      : (amount > 0 ? [paymentMode] : []);
    const allModes = [...new Set([...existingModes, ...newModes])];
    const finalMode = allModes.length > 1 ? "Mixed" : (allModes[0] || paymentMode);

    // Record in payments table
    if (amount > 0) {
      if (isSplitRecord) {
        const splitRows = [];
        if (splitCashAmt > 0) splitRows.push({ order_id: paymentModalOrder.id, amount: splitCashAmt, payment_mode: "Cash" });
        if (splitGpayAmt > 0) splitRows.push({ order_id: paymentModalOrder.id, amount: splitGpayAmt, payment_mode: "GPay" });
        if (splitRows.length > 0) await supabase.from('payments').insert(splitRows);
      } else {
        await supabase
          .from('payments')
          .insert({ order_id: paymentModalOrder.id, amount, payment_mode: paymentMode });
      }
    }

    // Update order totals
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        amount_paid: newAmountPaid,
        total: finalTotal,
        discount: newDiscount,
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
        total: finalTotal,
        discount: newDiscount,
        status: newStatus,
        paymentMode: finalMode,
        statusLocked
      };

      setOrders(orders.map(o => o.id === paymentModalOrder.id ? updatedOrder : o));

      if (selectedOrder && selectedOrder.id === paymentModalOrder.id) {
        setSelectedOrder(updatedOrder);
        if (amount > 0) {
          setOrderPayments(prev => [...prev, {
            id: Date.now(),
            order_id: paymentModalOrder.id,
            amount,
            payment_mode: paymentMode,
            recorded_at: new Date().toISOString()
          }]);
        }
      }

      const msgParts = [];
      if (amount > 0) msgParts.push(`₹${amount.toLocaleString()} via ${paymentMode}`);
      if (writeoff > 0) msgParts.push(`₹${writeoff.toLocaleString()} Discount`);
      
      setUpdateFeedback(`✓ ${msgParts.join(' + ')} recorded for Order ${paymentModalOrder.id}. ${statusLocked ? 'Bill Closed 🔒' : ''}`);
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

  const sendWhatsApp = (order: Order) => {
    const target = order.phone?.length === 10 ? order.phone : "7904199050";
    const restToPay = Math.max(0, order.total - order.amountPaid);
    const invoiceUrl = `${window.location.origin}/invoice/${order.id}`;

    let text = `*NMG PHOTOPARK — Invoice*\n`;
    text += `Invoice ID: ${order.id}\n`;
    text += `Date: ${order.date}\n`;
    text += `Customer: ${order.customer}\n`;
    text += `Mobile: ${order.phone || 'N/A'}\n\n`;
    text += `Product: ${order.product}\n`;
    if (order.details) text += `Details: ${order.details}\n`;
    text += `\n`;
    text += `Total Amount: ₹${order.total.toLocaleString()}\n`;
    if (order.amountPaid > 0) text += `Amount Paid: ₹${order.amountPaid.toLocaleString()}\n`;
    if (restToPay > 0) text += `*Balance Due: ₹${restToPay.toLocaleString()}*\n`;
    text += `Payment Status: ${order.status}\n`;
    text += `\n`;
    text += `View Invoice: ${invoiceUrl}\n`;

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send/?phone=91${target}&text=${encoded}`, "_blank");
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Global Search Filter
      const matchesSearch =
        order.id.toLowerCase().includes(globalSearch.toLowerCase()) ||
        order.customer.toLowerCase().includes(globalSearch.toLowerCase()) ||
        order.phone.includes(globalSearch) ||
        order.product.toLowerCase().includes(globalSearch.toLowerCase());

      // Payment Status Filter
      const matchesStatus =
        statusFilter === "ALL STATUS" || order.status.toUpperCase() === statusFilter;

      // Date Filtering
      let matchesDate = true;
      if (fromDate && order.date < fromDate) matchesDate = false;
      if (toDate && order.date > toDate) matchesDate = false;

      // Delivery / Order Status Filter
      const statusLower = (order.deliveryStatus || "").toLowerCase();
      const filterLower = deliveryFilter.toLowerCase();
      const matchesDelivery =
        deliveryFilter === "ALL" ||
        statusLower === filterLower ||
        (filterLower === "ready" && statusLower.includes("ready")) ||
        (filterLower === "pending" && statusLower.includes("pending")) ||
        (filterLower === "processing" && statusLower.includes("processing"));

      return matchesSearch && matchesStatus && matchesDate && matchesDelivery;
    });
  }, [orders, globalSearch, statusFilter, deliveryFilter, fromDate, toDate]);

  return (
    <SidebarLayout>
      <div className="flex flex-col gap-4 sm:gap-5">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-dark-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-gray-900 rounded-full inline-block"></span>
              Order History
            </h2>
            <p className="text-sm text-dark-500 mt-1 pl-3.5 font-medium">Manage and track past invoices for NMG PHOTOPARK</p>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <div className="flex flex-wrap items-center justify-end gap-2 w-full">
              
              {/* Date Pickers */}
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 shadow-sm">
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
              <div className="flex items-center bg-white rounded-full p-1 border border-gray-200 shadow-sm">
                <span className="text-[10px] font-bold text-dark-500 px-3 uppercase tracking-widest hidden sm:inline">Period</span>
                {["ALL TIME", "TODAY", "THIS WEEK", "THIS MONTH", "THIS YEAR"].map(p => (
                  <button 
                    key={p}
                    onClick={() => handlePeriodChange(p)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-[10px] font-bold transition-all uppercase tracking-widest",
                      period === p ? "bg-gray-900 text-white shadow-sm" : "text-dark-600 hover:bg-gray-100"
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
              className="flex items-center gap-2 px-5 py-2 bg-white hover:bg-gray-100 text-dark-900 border border-gray-200 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors shadow-sm cursor-pointer"
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
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex-1 min-w-[260px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search by Order ID, Customer Name, Phone, or Product..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-gray-400 focus:bg-white text-sm font-medium text-dark-900 placeholder-dark-400 transition-colors" 
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Order / Delivery Status Filter Dropdown */}
            <div className="w-full sm:w-auto">
              <select
                value={deliveryFilter}
                onChange={(e) => setDeliveryFilter(e.target.value)}
                className="w-full sm:min-w-[215px] bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-8 py-3 outline-none focus:border-gray-400 focus:bg-white text-xs font-bold text-dark-900 uppercase tracking-wide transition-colors cursor-pointer"
              >
                <option value="ALL">All Order Status</option>
                <option value="Pending">Pending Order</option>
                <option value="Processing">Processing</option>
                <option value="Ready">Ready for Pickup</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>

            {/* Payment Status Filter Dropdown */}
            <div className="w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:min-w-[225px] bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-8 py-3 outline-none focus:border-gray-400 focus:bg-white text-xs font-bold text-dark-900 uppercase tracking-wide transition-colors cursor-pointer"
              >
                <option value="ALL STATUS">All Payment Status</option>
                <option value="PAID">Paid (Completed)</option>
                <option value="PARTIAL">Partial</option>
                <option value="UNPAID">Unpaid (Pending)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Delivery Status Filter Pills */}
        <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest pr-1">Order Status:</span>
          {[
            { label: "All Orders", value: "ALL" },
            { label: "Pending", value: "Pending" },
            { label: "Processing", value: "Processing" },
            { label: "Ready for Pickup", value: "Ready" },
            { label: "Delivered", value: "Delivered" },
          ].map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setDeliveryFilter(value)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-[10px] font-bold transition-all uppercase tracking-wider border",
                deliveryFilter === value
                  ? value === "ALL" ? "bg-dark-900 text-white border-dark-900"
                    : value === "Pending" ? "bg-amber-500 text-white border-amber-500"
                    : value === "Processing" ? "bg-blue-600 text-white border-blue-600"
                    : value === "Ready" ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-purple-600 text-white border-purple-600"
                  : "bg-white text-dark-600 border-gray-200 hover:bg-gray-100"
              )}
            >
              {label}
            </button>
          ))}
          {deliveryFilter !== "ALL" && (
            <span className="ml-auto text-[10px] font-bold text-dark-400">
              {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
            </span>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="px-6 py-4 text-[10px] font-bold text-dark-500 uppercase tracking-widest">Date / Order ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-dark-500 uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-dark-500 uppercase tracking-widest">Product</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-dark-500 uppercase tracking-widest">Total / Rest</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-dark-500 uppercase tracking-widest">Payment Mode & Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-dark-500 uppercase tracking-widest">Delivery Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-dark-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const isEditable = !order.statusLocked && (order.status === "Unpaid" || order.status === "Pending" || order.status === "Partial");
                    const restToPay = Math.max(0, order.total - order.amountPaid);
                    
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
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
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-gray-100 text-dark-900 border border-gray-200 flex items-center gap-1">
                              <Banknote size={12} className="text-gray-600" />
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
                              "bg-gray-50 text-dark-700 border-gray-200"
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

                            {order.phone && (
                              <button
                                onClick={() => sendWhatsApp(order)}
                                title="Send invoice via WhatsApp"
                                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg border border-green-300 bg-green-50 hover:bg-green-100 text-green-900 shadow-sm transition-colors cursor-pointer"
                              >
                                <MessageCircle size={12} />
                                WhatsApp
                              </button>
                            )}

                            <button 
                              onClick={() => setSelectedOrder(order)}
                              className="text-[10px] font-bold text-gray-700 hover:text-dark-900 uppercase tracking-widest transition-colors ml-1"
                            >
                              Details →
                            </button>

                            <button
                              onClick={async () => {
                                if (!confirm(`Delete order ${order.id}? This will also delete its payments and items. Cannot be undone.`)) return;
                                // cascade delete logic handled client side just in case
                                await supabase.from('payments').delete().eq('order_id', order.id);
                                await supabase.from('order_items').delete().eq('order_id', order.id);
                                const { error } = await supabase.from('orders').delete().eq('id', order.id);
                                if (error) alert("Error deleting order: " + error.message);
                                else setOrders(prev => prev.filter(o => o.id !== order.id));
                              }}
                              title="Delete Order"
                              className="text-red-400 hover:text-red-600 transition-colors ml-2 p-1.5 rounded hover:bg-red-50 flex items-center justify-center shrink-0"
                            >
                              <Trash2 size={14} />
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
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/80">
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
              <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200 space-y-1">
                <div className="text-xs font-bold text-dark-900">{paymentModalOrder.id} • {paymentModalOrder.customer}</div>
                <div className="flex justify-between text-xs text-dark-600">
                  <span>Total Amount: <strong>₹{paymentModalOrder.total.toLocaleString()}</strong></span>
                  <span>Already Paid: <strong className="text-emerald-700">₹{paymentModalOrder.amountPaid.toLocaleString()}</strong></span>
                </div>
                <div className="text-xs font-black text-red-600 pt-1 border-t border-gray-200 mt-1">
                  Remaining Balance: ₹{(paymentModalOrder.total - paymentModalOrder.amountPaid).toLocaleString()}
                </div>
              </div>

                  <div className="flex gap-3 items-start">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-dark-500 uppercase tracking-widest mb-1.5">
                        Payment Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => {
                          const restToPay = paymentModalOrder.total - paymentModalOrder.amountPaid;
                          let val = parseFloat(e.target.value) || 0;
                          if (val > restToPay) val = restToPay;
                          setPaymentAmount(val === 0 ? e.target.value : val.toString());
                          // Auto-calculate discount as the remaining unpaid portion
                          const discount = Math.max(0, restToPay - val);
                          setDiscountWriteoff(discount > 0 ? discount.toFixed(2) : "0");
                        }}
                        placeholder={`Max ₹${paymentModalOrder.total - paymentModalOrder.amountPaid}`}
                        className="w-full bg-gray-50 border border-gray-200 focus:border-gray-400 rounded-xl px-4 py-2.5 text-base font-black text-dark-900 outline-none transition-colors"
                      />
                    </div>
                    
                    <div className="w-1/3">
                      <label className="block text-[10px] font-bold text-dark-500 uppercase tracking-widest mb-1.5">
                        Discount (₹) <span className="text-[9px] font-medium normal-case tracking-normal text-dark-400">auto</span>
                      </label>
                      <div className="w-full bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-base font-black text-red-700 select-none">
                        ₹{parseFloat(discountWriteoff) > 0 ? parseFloat(discountWriteoff).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                      </div>
                    </div>
                  </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">
                    Select Payment Mode <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => { setIsSplitRecord(!isSplitRecord); setSplitCashRecord(""); setSplitGpayRecord(""); }}
                    className={cn(
                      "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border transition-colors",
                      isSplitRecord
                        ? "bg-amber-100 text-amber-800 border-amber-300"
                        : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                    )}
                  >
                    {isSplitRecord ? "✓ Split" : "+ Split"}
                  </button>
                </div>

                {isSplitRecord ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-[9px] font-bold text-emerald-700 mb-1 uppercase tracking-widest">Cash ₹</label>
                        <input
                          type="number"
                          value={splitCashRecord}
                          onChange={(e) => setSplitCashRecord(e.target.value)}
                          placeholder="0"
                          className="w-full bg-emerald-50 border border-emerald-200 focus:border-emerald-400 rounded-xl px-4 py-2.5 text-sm font-black text-dark-900 outline-none"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[9px] font-bold text-blue-700 mb-1 uppercase tracking-widest">GPay ₹</label>
                        <input
                          type="number"
                          value={splitGpayRecord}
                          onChange={(e) => setSplitGpayRecord(e.target.value)}
                          placeholder="0"
                          className="w-full bg-blue-50 border border-blue-200 focus:border-blue-400 rounded-xl px-4 py-2.5 text-sm font-black text-dark-900 outline-none"
                        />
                      </div>
                    </div>
                    {(() => {
                      const splitTotal = (parseFloat(splitCashRecord) || 0) + (parseFloat(splitGpayRecord) || 0);
                      const expected = parseFloat(paymentAmount) || 0;
                      const diff = splitTotal - expected;
                      return (
                        <div className={cn(
                          "text-[9px] font-bold text-right",
                          Math.abs(diff) < 0.01 ? "text-emerald-600" : "text-red-600"
                        )}>
                          Split total: ₹{splitTotal.toLocaleString()} / ₹{expected.toLocaleString()}
                          {Math.abs(diff) >= 0.01 && (diff > 0 ? ` (+₹${diff})` : ` (-₹${Math.abs(diff)})`)}
                        </div>
                      );
                    })()}
                  </div>
                ) : (
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
                            : "bg-white text-dark-700 border-gray-200 hover:bg-gray-100"
                        )}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalOrder(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-dark-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={recordingPayment || (!parseFloat(paymentAmount) && !parseFloat(discountWriteoff))}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 size={15} />
                  {recordingPayment ? "Saving..." : ((parseFloat(paymentAmount)||0) + (parseFloat(discountWriteoff)||0) >= (paymentModalOrder.total - paymentModalOrder.amountPaid) ? "Record & Close" : "Record")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-dark-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/80 shrink-0">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-dark-900 tracking-widest uppercase flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-gray-900 rounded-full"></span>
                  Order Details
                </h3>
                <Link
                  href={`/invoice/${selectedOrder.id}`}
                  target="_blank"
                  className="text-[10px] font-bold text-gray-700 hover:text-dark-900 uppercase tracking-widest flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200 transition-colors"
                >
                  Print Invoice <ExternalLink size={11} />
                </Link>
                {selectedOrder.phone && (
                  <button
                    onClick={() => sendWhatsApp(selectedOrder)}
                    className="text-[10px] font-bold text-green-700 hover:text-green-900 uppercase tracking-widest flex items-center gap-1 bg-green-50 px-2.5 py-1 rounded-full border border-green-200 transition-colors"
                  >
                    <MessageCircle size={11} /> WhatsApp
                  </button>
                )}
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-dark-400 hover:text-dark-900 transition-colors p-1"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>
            
            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="flex justify-between items-start pb-4 border-b border-gray-100">
                <div>
                  <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-1">Order ID</div>
                  <div className="font-bold text-dark-900 text-sm">{selectedOrder.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-1">Date</div>
                  <div className="font-bold text-dark-900 text-sm">{selectedOrder.date}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
                <div>
                  <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-1">Customer</div>
                  <div className="font-bold text-dark-900 text-sm">{selectedOrder.customer}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-1">Phone</div>
                  <div className="font-bold text-dark-900 text-sm">{selectedOrder.phone}</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-1">Product</div>
                    <div className="font-bold text-gray-800 uppercase text-sm">{selectedOrder.product}</div>
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
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
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
                    className="w-full text-xs font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border border-gray-300 bg-gray-50 text-dark-900 focus:outline-none cursor-pointer"
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
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2">Order Expenses</div>
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
