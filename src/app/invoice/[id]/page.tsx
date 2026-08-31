"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";
import { ShoppingBag, MapPin, Phone, Printer, Copy, Check, Camera, CreditCard } from "lucide-react";
import Link from "next/link";

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', id)
        .single();

      if (error || !data) {
        setError(true);
      } else {
        setOrder(data);
        document.title = `Invoice ${data.id} - NMG PhotoShop`;

        // Fetch payment ledger history
        const { data: payData } = await supabase
          .from('payments')
          .select('*')
          .eq('order_id', data.id)
          .order('recorded_at', { ascending: true });
        
        setPayments(payData || []);
      }
      setLoading(false);
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-dark-900 rounded-full flex items-center justify-center">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <p className="text-dark-600 font-bold tracking-widest uppercase text-sm">Generating Digital Bill...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-dark-900 font-bold text-xl">Invoice Not Found</p>
        <Link href="/" className="px-6 py-2 bg-dark-900 hover:bg-dark-800 rounded-lg text-white font-bold transition-colors uppercase tracking-widest text-xs">
          Return Home
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const discountAmount = order.discount || 0;
  const totalAmount = order.total || 0;
  const subtotal = totalAmount + discountAmount;
  const items = order.order_items || [];
  const amountPaid = order.amount_paid || 0;
  const restToPay = Math.max(0, totalAmount - amountPaid);

  const BRANCH_INFO: Record<string, { name: string; phone: string }> = {
    "chennai-main": { name: "Sarada College Road", phone: "90877 09117, 96299 09117" },
    "bangalore-hub": { name: "Puthuroad", phone: "96299 19117, 96299 09115" },
    "mumbai-central": { name: "Old Bustand", phone: "96299 09115, 96299 09117" },
  };
  const branch = BRANCH_INFO[order.branch_id as string] || BRANCH_INFO["chennai-main"];

  return (
    <div className="min-h-screen bg-gray-50 text-dark-900 font-sans py-12 px-4 print:p-0 print:bg-white flex flex-col items-center">
      <style>{`
        @media print {
          @page {
            margin: 5mm;
          }
          body {
            background-color: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
            zoom: 0.92;
          }
        }
      `}</style>
      
      {/* Top Navigation / Action Bar (Hidden when printing) */}
      <div className="w-full max-w-3xl flex justify-between items-center mb-8 print:hidden">
        <Link 
          href="/" 
          className="text-xs font-bold text-dark-600 hover:text-dark-900 uppercase tracking-widest flex items-center gap-1"
        >
          ← Back to Store
        </Link>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleCopyLink}
            className="flex items-center gap-2 bg-white hover:bg-gray-100 text-dark-700 hover:text-dark-900 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg shadow-sm border border-gray-200 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy Link
              </>
            )}
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-dark-900 hover:bg-dark-800 text-white font-bold text-xs uppercase tracking-wider px-5 py-2 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Download PDF / Print
          </button>
        </div>
      </div>

      {/* The Invoice Document */}
      <div className="w-full max-w-3xl bg-white border border-gray-200 rounded-2xl shadow-xl print:shadow-none print:border-none print:rounded-none overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-gray-50/80 border-b border-gray-200 p-8 sm:p-12 print:p-4 flex flex-col items-center text-center">
          <img src="/logo.png" alt="NMG Photo Park" className="w-16 h-16 object-contain mb-3" />
          <h1 className="text-3xl font-black text-dark-900 tracking-tight">NMG Photo Park</h1>
          <p className="text-xs text-dark-500 font-bold tracking-wider mt-1 mb-4">INVOICE #{order.id}</p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-dark-600 font-semibold">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-600 shrink-0" />
              <span>Branch: {branch.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-gray-600 shrink-0" />
              <span>{branch.phone}</span>
            </div>
          </div>
        </div>

        {/* Invoice Meta Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 p-8 sm:p-12 print:p-4 print:gap-4 border-b border-gray-100">
          
          {/* Left Column: Order Info */}
          <div>
            <h3 className="text-[10px] font-bold text-dark-400 uppercase tracking-[0.2em] mb-3">Order Info</h3>
            <div className="space-y-1.5 text-xs text-left">
              <div>
                <span className="text-dark-400 font-bold">Billed Date: </span>
                <span className="text-dark-900 font-black">{new Date(order.date || order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
              <div>
                <span className="text-dark-400 font-bold">Payment Status: </span>
                <span className={`font-black uppercase ${order.payment_status === 'Paid' ? 'text-emerald-600' : order.payment_status === 'Partial' ? 'text-amber-600' : 'text-red-600'}`}>
                  {order.payment_status || 'Unpaid'}
                </span>
              </div>
              {order.delivery_status && (
                <div>
                  <span className="text-dark-400 font-bold">Delivery Status: </span>
                  <span className="text-dark-900 font-black uppercase">{order.delivery_status}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Customer Info */}
          <div className="sm:text-right flex flex-col sm:items-end">
            <h3 className="text-[10px] font-bold text-dark-400 uppercase tracking-[0.2em] mb-3 self-start sm:self-auto">Billed To</h3>
            <p className="text-base font-bold text-dark-900">{order.customer_name || "Walk-in Customer"}</p>
            {order.customer_phone && (
              <p className="text-sm text-dark-600 font-semibold mt-1">+91 {order.customer_phone}</p>
            )}
            {order.source && (
              <span className="inline-block mt-2 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-dark-800">
                Source: {order.source}
              </span>
            )}
          </div>
          
        </div>

        {/* Items Table */}
        <div className="p-8 sm:p-12 print:py-2 print:px-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="py-4 text-[11px] font-bold text-dark-400 uppercase tracking-wider">Item Description</th>
                <th className="py-4 text-[11px] font-bold text-dark-400 uppercase tracking-wider text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item: any, index: number) => {
                return (
                  <tr key={index} className="group">
                    <td className="py-5 pr-4 print:py-3">
                      <p className="text-sm font-bold text-dark-900">{item.product}</p>
                      {(item.details || item.id_number || item.delivery_date) && (
                        <div className="text-xs text-dark-500 mt-1 space-y-0.5 font-medium">
                          {item.details && <p>Details: {item.details}</p>}
                          {item.id_number && <p>ID: {item.id_number}</p>}
                          {item.delivery_date && <p>Expected Delivery: {item.delivery_date}</p>}
                        </div>
                      )}
                    </td>
                    <td className="py-5 pl-4 print:py-3 text-right text-sm font-black text-dark-900">₹{parseFloat(item.amount).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Payment History Log Breakdown (if available) */}
        {payments.length > 0 && (
          <div className="mx-8 sm:mx-12 mb-6 p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl print:mx-4">
            <h4 className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
              <CreditCard size={13} />
              Payment Installment Breakdown
            </h4>
            <div className="space-y-1.5">
              {payments.map((p, idx) => (
                <div key={p.id || idx} className="flex justify-between items-center text-xs">
                  <span className="font-bold text-dark-700">
                    Payment #{idx + 1}: <span className="uppercase text-emerald-800">{p.payment_mode || 'Cash'}</span>
                    <span className="text-dark-400 font-normal ml-2">
                      ({new Date(p.recorded_at).toLocaleDateString('en-IN', { month: 'short', day: '2-digit' })})
                    </span>
                  </span>
                  <span className="font-black text-emerald-700">₹{parseFloat(p.amount).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Totals Section */}
        <div className="bg-gray-50/80 border-t border-gray-200 p-8 sm:p-12 print:p-4 flex justify-end">
            <div className="w-full sm:w-1/2 space-y-3">
              {(discountAmount > 0) && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-dark-400 font-bold uppercase tracking-wider">Subtotal</span>
                  <span className="font-bold text-dark-900">₹{subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </div>
              )}
              
              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-dark-400 font-bold uppercase tracking-wider">
                    Discount
                  </span>
                  <span className="font-bold text-red-600">-₹{discountAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4 mt-2 flex justify-between items-center">
                <span className="text-sm font-black text-dark-900 uppercase tracking-widest">Grand Total</span>
                <span className="text-2xl font-black text-dark-900 drop-shadow-sm">₹{totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2">
                <span className="text-dark-400 font-bold uppercase tracking-wider">Amount Paid</span>
                <span className="font-bold text-emerald-700">₹{amountPaid.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-1">
                <span className="text-dark-400 font-bold uppercase tracking-wider">Balance Due</span>
                <span className={`font-black ${restToPay > 0 ? 'text-red-600' : 'text-dark-400'}`}>
                  ₹{restToPay.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                </span>
              </div>
            </div>
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-100 p-6 print:p-2 text-center bg-gray-50/80 flex flex-col items-center justify-center gap-1.5">
          <p className="text-xs font-bold text-dark-900 tracking-wider uppercase">Thank you for choosing NMG Photo Park!</p>
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.15em]">NMG Photo Park POS</p>
        </div>

      </div>
    </div>
  );
}
