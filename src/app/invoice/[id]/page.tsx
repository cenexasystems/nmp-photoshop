"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";
import { ShoppingBag, MapPin, Phone, Printer, Copy, Check } from "lucide-react";
import Link from "next/link";

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<any>(null);
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
        document.title = `Invoice - ${data.id}`;
      }
      setLoading(false);
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gold-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-dark-900 rounded-full flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-brand-gold" />
          </div>
          <p className="text-dark-600 font-bold tracking-widest uppercase text-sm">Generating Digital Bill...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gold-50 flex flex-col items-center justify-center gap-4">
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

  return (
    <div className="min-h-screen bg-gold-50 text-dark-900 font-sans py-12 px-4 print:p-0 print:bg-white flex flex-col items-center">
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
      <div className="w-full max-w-3xl flex justify-end items-center mb-8 print:hidden gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleCopyLink}
            className="flex items-center gap-2 bg-white hover:bg-gold-50 text-dark-700 hover:text-dark-900 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg shadow-sm border border-gold-200 transition-colors cursor-pointer"
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
            className="flex items-center gap-2 bg-dark-900 hover:bg-dark-800 text-brand-gold font-bold text-xs uppercase tracking-wider px-5 py-2 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Download PDF / Print
          </button>
        </div>
      </div>

      {/* The Invoice Document */}
      <div className="w-full max-w-3xl bg-white border border-gold-200 rounded-2xl shadow-xl print:shadow-none print:border-none print:rounded-none overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-gold-50/30 border-b border-gold-200 p-8 sm:p-12 print:p-4 flex flex-col items-center text-center">
          <h1 className="text-3xl font-black text-dark-900 tracking-tight">Golden Studio</h1>
          <p className="text-xs text-dark-500 font-bold tracking-wider mt-1 mb-4">INVOICE: {order.id}</p>
          
          <div className="flex flex-col items-center gap-2 text-sm text-dark-600 font-semibold">
            <div className="text-center w-full leading-relaxed">
              <span className="inline-block text-brand-gold mr-1.5 align-middle -mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
              </span>
              <span>Branch: {order.branch_id.replace('-', ' ').toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <Phone className="w-3.5 h-3.5 text-brand-gold shrink-0" />
              <span>+91 99999 99999</span>
            </div>
          </div>
        </div>

        {/* Invoice Meta Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 p-8 sm:p-12 print:p-4 print:gap-4 border-b border-gold-100">
          <div>
            <h3 className="text-[10px] font-bold text-dark-400 uppercase tracking-[0.2em] mb-3">Billed To</h3>
            <p className="text-base font-bold text-dark-900">{order.customer_name || "Walk-in Customer"}</p>
            {order.customer_phone && (
              <p className="text-sm text-dark-600 font-semibold mt-1">+91 {order.customer_phone}</p>
            )}
          </div>
          <div className="sm:text-right flex flex-col sm:items-end">
            <h3 className="text-[10px] font-bold text-dark-400 uppercase tracking-[0.2em] mb-3 self-start sm:self-auto">Order Details</h3>
            <div className="inline-block text-left text-sm">
              <div className="flex flex-wrap gap-x-4 gap-y-1 justify-start sm:justify-end">
                <div className="flex gap-1.5">
                  <span className="text-dark-400 font-bold">Date:</span>
                  <span className="text-dark-900 font-black">{new Date(order.date || order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex gap-1.5">
                  <span className="text-dark-400 font-bold">Time:</span>
                  <span className="text-dark-900 font-black">{new Date(order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex gap-1.5">
                  <span className="text-dark-400 font-bold">Status:</span>
                  <span className="text-dark-900 font-black uppercase">{order.payment_status || 'Unpaid'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="p-8 sm:p-12 print:py-2 print:px-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gold-200">
                <th className="py-4 text-[11px] font-bold text-dark-400 uppercase tracking-wider">Item Description</th>
                <th className="py-4 text-[11px] font-bold text-dark-400 uppercase tracking-wider text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-50">
              {items.map((item: any, index: number) => {
                return (
                  <tr key={index} className="group">
                    <td className="py-6 pr-4 print:py-3">
                      <p className="text-sm font-bold text-dark-900">{item.product}</p>
                      {(item.details || item.id_number || item.delivery_date) && (
                        <div className="text-xs text-dark-500 mt-1 space-y-0.5 font-medium">
                          {item.details && <p>Details: {item.details}</p>}
                          {item.id_number && <p>ID: {item.id_number}</p>}
                          {item.delivery_date && <p>Delivery: {item.delivery_date}</p>}
                        </div>
                      )}
                    </td>
                    <td className="py-6 pl-4 print:py-3 text-right text-sm font-black text-dark-900">₹{parseFloat(item.amount).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="bg-gold-50/30 border-t border-gold-200 p-8 sm:p-12 print:p-4 flex justify-end">
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

              <div className="border-t border-gold-200 pt-4 mt-2 flex justify-between items-center">
                <span className="text-sm font-black text-dark-900 uppercase tracking-widest">Total Amount</span>
                <span className="text-3xl font-black text-brand-gold drop-shadow-sm">₹{totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2">
                <span className="text-dark-400 font-bold uppercase tracking-wider">Amount Paid</span>
                <span className="font-bold text-dark-900">₹{(order.amount_paid || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-1">
                <span className="text-dark-400 font-bold uppercase tracking-wider">Rest to Pay</span>
                <span className="font-bold text-red-600">₹{(totalAmount - (order.amount_paid || 0)).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
              </div>
            </div>
        </div>
        
        {/* Footer */}
        <div className="border-t border-gold-100 p-6 print:p-2 text-center bg-gold-50/30 flex flex-col items-center justify-center gap-1.5">
          <p className="text-xs font-bold text-dark-900 tracking-wider uppercase">Thank you for choosing us!</p>
          <p className="text-[9px] font-bold text-brand-gold uppercase tracking-[0.15em]">Golden Studio POS</p>
        </div>

      </div>
    </div>
  );
}
