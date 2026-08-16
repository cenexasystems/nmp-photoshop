"use client";

import { AdminSidebarLayout } from "@/components/AdminSidebarLayout";
import { Search, ChevronLeft, ChevronRight, Phone, User, Calendar, ShoppingBag, X, PackageCheck, CreditCard } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/lib/supabase";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface OrderItem {
  id: string;
  customer: string;
  phone: string;
  source: string;
  total: number;
  status: string;
  product: string;
  date: string;
  paymentMode: string;
  deliveryStatus: string;
  details: string;
  idNumber?: string;
}

interface CustomerGroup {
  name: string;
  phone: string;
  totalOrdersCount: number;
  totalSpent: number;
  latestDate: string;
  orders: OrderItem[];
}

const ITEMS_PER_PAGE = 5;

export default function CustomerOrdersPage() {
  const [allOrders, setAllOrders] = useState<OrderItem[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomerGroup, setSelectedCustomerGroup] = useState<CustomerGroup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      const { data, error } = await supabase
        .from('orders')
        .select(`*, order_items (*)`)
        .order('date', { ascending: false });

      if (data && !error) {
        const mappedOrders: OrderItem[] = data.map((o: any) => ({
          id: o.id,
          customer: o.customer_name || 'Walk-in',
          phone: o.customer_phone || '',
          source: o.source,
          total: o.total,
          status: o.payment_status,
          product: o.order_items?.map((i: any) => i.product).join(', ') || '',
          date: o.date,
          paymentMode: o.payment_mode,
          deliveryStatus: o.delivery_status,
          details: o.order_items?.map((i: any) => i.details).join(', ') || '',
          idNumber: o.order_items?.[0]?.id_number || ''
        }));
        setAllOrders(mappedOrders);
      }
      setLoading(false);
    }
    loadOrders();
  }, []);

  // Group raw orders by Customer Phone & Name
  const customerGroups = useMemo(() => {
    const map = new Map<string, CustomerGroup>();

    allOrders.forEach((order) => {
      const key = order.phone || order.customer.toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          name: order.customer || "Walk-in Customer",
          phone: order.phone || "N/A",
          totalOrdersCount: 0,
          totalSpent: 0,
          latestDate: order.date,
          orders: []
        });
      }
      const group = map.get(key)!;
      group.orders.push(order);
      group.totalOrdersCount += 1;
      group.totalSpent += order.total || 0;
      if (order.date > group.latestDate) {
        group.latestDate = order.date;
      }
    });

    return Array.from(map.values());
  }, [allOrders]);

  // Filter Customer Groups by Name or Phone
  const filteredCustomers = useMemo(() => {
    const q = search.toLowerCase();
    return customerGroups.filter((c) =>
      c.name.toLowerCase().includes(q) || c.phone.includes(q)
    );
  }, [customerGroups, search]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  return (
    <AdminSidebarLayout>
      <div className="flex flex-col gap-4 sm:gap-5">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-dark-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-gray-900 rounded-full inline-block"></span>
              Customer Directory & Order Details
            </h2>
            <p className="text-sm text-dark-500 mt-1 pl-3.5 font-medium">
              View registered customers, their order history, and full product details
            </p>
          </div>
        </div>

        {/* Search & Summary Bar */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-200 flex flex-wrap gap-3 sm:gap-4 items-center justify-between">
          <div className="flex-1 w-full md:w-auto relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by customer name or phone number..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-gray-400 focus:bg-white text-sm font-medium text-dark-900 placeholder-dark-400 transition-colors" 
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold text-dark-700">
              Total Customers: <span className="text-dark-900 font-black">{filteredCustomers.length}</span>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="px-4 py-3 sm:px-6 sm:py-3.5 text-[10px] font-bold text-dark-500 uppercase tracking-widest">Customer Name & Phone</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-3.5 text-[10px] font-bold text-dark-500 uppercase tracking-widest">Total Orders</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-3.5 text-[10px] font-bold text-dark-500 uppercase tracking-widest">Total Spent</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-3.5 text-[10px] font-bold text-dark-500 uppercase tracking-widest">Last Order Date</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-3.5 text-[10px] font-bold text-dark-500 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedCustomers.length > 0 ? (
                  paginatedCustomers.map((cust, i) => (
                    <tr 
                      key={i} 
                      onClick={() => setSelectedCustomerGroup(cust)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3 sm:px-6 sm:py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gray-100 text-dark-900 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-dark-900 group-hover:text-white transition-colors">
                            <User size={16} />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-dark-900 block">{cust.name}</span>
                            <span className="text-[10px] font-bold text-dark-400 tracking-widest flex items-center gap-1">
                              <Phone size={10} className="text-gray-500" /> {cust.phone}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-3.5">
                        <span className="text-xs font-bold text-dark-900 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full inline-block">
                          {cust.totalOrdersCount} {cust.totalOrdersCount === 1 ? "Order" : "Orders"}
                        </span>
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-3.5">
                        <span className="text-sm font-black text-dark-900">₹{cust.totalSpent.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-3.5">
                        <span className="text-xs font-bold text-dark-700 flex items-center gap-1">
                          <Calendar size={12} className="text-gray-500" /> {cust.latestDate}
                        </span>
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-3.5 text-right">
                        <span className="text-xs font-bold text-gray-700 group-hover:text-dark-900 transition-colors uppercase tracking-widest">
                          View Orders ({cust.totalOrdersCount}) →
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-dark-400 font-bold text-xs tracking-widest uppercase">
                      No customer records found matching "{search}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-4 py-3 sm:p-4 border-t border-gray-200 bg-gray-50/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs font-bold text-dark-500 uppercase tracking-widest">
              Showing <span className="text-dark-900">{filteredCustomers.length > 0 ? startIndex + 1 : 0}</span> to{" "}
              <span className="text-dark-900">{Math.min(startIndex + ITEMS_PER_PAGE, filteredCustomers.length)}</span> of{" "}
              <span className="text-dark-900">{filteredCustomers.length}</span> customers
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-gray-200 bg-white text-dark-700 hover:bg-gray-100 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                title="Previous Page"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "w-8 h-8 rounded-xl text-xs font-bold transition-all border",
                      currentPage === page
                        ? "bg-dark-900 text-white border-dark-900 shadow-sm"
                        : "bg-white text-dark-700 border-gray-200 hover:bg-gray-100"
                    )}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2 rounded-xl border border-gray-200 bg-white text-dark-700 hover:bg-gray-100 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                title="Next Page"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Customer All Orders Modal */}
      {selectedCustomerGroup && (
        <div className="fixed inset-0 bg-dark-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
            
            {/* Modal Top Banner */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-dark-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-dark-900 uppercase tracking-wide">
                    {selectedCustomerGroup.name}
                  </h3>
                  <div className="text-xs font-bold text-gray-700 flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1"><Phone size={12} /> {selectedCustomerGroup.phone}</span>
                    <span>•</span>
                    <span>{selectedCustomerGroup.totalOrdersCount} Total {selectedCustomerGroup.totalOrdersCount === 1 ? 'Order' : 'Orders'}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedCustomerGroup(null)}
                className="text-dark-400 hover:text-dark-900 transition-colors p-1.5 rounded-lg hover:bg-white"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>
            
            {/* Modal Body - Order Cards List */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="text-xs font-bold text-dark-500 uppercase tracking-widest mb-1 flex items-center justify-between">
                <span>All Orders ({selectedCustomerGroup.orders.length})</span>
                <span>Combined Spent: <strong className="text-dark-900">₹{selectedCustomerGroup.totalSpent.toLocaleString()}</strong></span>
              </div>

              {selectedCustomerGroup.orders.map((order, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:border-gray-400 transition-colors space-y-3">
                  
                  {/* Order Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gray-900"></span>
                      <span className="font-bold text-dark-900 text-sm">{order.id}</span>
                      <span className="text-[10px] font-bold text-dark-400 tracking-widest flex items-center gap-1 ml-2">
                        <Calendar size={10} className="text-gray-500" /> {order.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={cn("text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border",
                        order.status === "Paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        order.status === "Unpaid" ? "bg-red-50 text-red-700 border-red-200" :
                        "bg-amber-50 text-amber-700 border-amber-200"
                      )}>
                        {order.status}
                      </span>

                      <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-gray-100 text-dark-700 border border-gray-200">
                        {order.deliveryStatus}
                      </span>
                    </div>
                  </div>

                  {/* Order Card Product Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50/80 p-3 rounded-lg border border-gray-100">
                    <div>
                      <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-0.5">Product Name</div>
                      <div className="font-bold text-gray-800 text-sm uppercase flex items-center gap-1.5">
                        <ShoppingBag size={14} /> {order.product}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-0.5">Product Price</div>
                      <div className="font-black text-dark-900 text-base">₹{order.total.toLocaleString()}</div>
                    </div>

                    {order.details && (
                      <div className="sm:col-span-2 pt-1 border-t border-gray-100">
                        <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-0.5">Item Specifications / Details</div>
                        <div className="font-medium text-dark-800 text-xs">{order.details}</div>
                      </div>
                    )}

                    {order.idNumber && (
                      <div className="sm:col-span-2 pt-1">
                        <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest mb-0.5">Product ID / Document No.</div>
                        <div className="font-bold text-dark-900 text-xs">{order.idNumber}</div>
                      </div>
                    )}
                  </div>

                  {/* Payment Details */}
                  <div className="flex items-center justify-between text-xs pt-1 px-1 font-bold text-dark-600">
                    <span className="flex items-center gap-1 text-[11px] uppercase tracking-wider">
                      <CreditCard size={13} className="text-gray-500" /> Payment Method: <strong className="text-dark-900">{order.paymentMode}</strong>
                    </span>
                    <span className="text-[11px] uppercase tracking-wider">
                      Source: <strong className="text-dark-900">{order.source}</strong>
                    </span>
                  </div>

                </div>
              ))}
            </div>

          </div>
        </div>
      )}

    </AdminSidebarLayout>
  );
}
