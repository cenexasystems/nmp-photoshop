"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Calculator, 
  History, 
  BarChart3, 
  LogOut, 
  Menu,
  X,
  Users,
  Wallet,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NAV_ITEMS = [
  { href: "/admin/secure/portal/analytics", label: "ANALYTICS", icon: BarChart3 },
  { href: "/admin/secure/portal/expenses", label: "EXPENSES", icon: Wallet },
  { href: "/admin/secure/portal/customers", label: "CUSTOMER ORDERS", icon: Users },
  { href: "/", label: "BACK TO POS", icon: Calculator },
];

export function AdminSidebarLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[#f3f4f6] text-dark-900 overflow-hidden font-sans selection:bg-gray-200 selection:text-dark-900">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-dark-950/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 bg-gray-900 text-white border-r border-gray-800 flex flex-col transition-all duration-300 shadow-lg",
        isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 lg:relative",
        isCollapsed && !isMobileOpen ? "lg:w-20" : "lg:w-64"
      )}>
        <div className={cn("p-6 flex items-center border-b border-gray-800", 
          isCollapsed && !isMobileOpen ? "justify-center" : "justify-between"
        )}>
          <div className="flex items-center gap-3 transition-all">
            <img src="/logo.png" alt="NMG Logo" className="w-8 h-8 object-contain shrink-0 rounded-lg shadow-sm" />
            {(!isCollapsed || isMobileOpen) && (
              <div>
                <h1 className="font-bold text-base tracking-wider uppercase text-white whitespace-nowrap">NMG PHOTOPARK</h1>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 bg-gray-800 px-2 py-0.5 rounded-md inline-block">Admin Portal</p>
              </div>
            )}
          </div>
          
          <button className="lg:hidden text-gray-400 hover:text-white transition-colors" onClick={() => setIsMobileOpen(false)}>
            <X size={24} strokeWidth={2} />
          </button>
        </div>


        <nav className="flex-1 py-6 flex flex-col gap-1.5 px-3 overflow-y-auto overflow-x-hidden">
          {(!isCollapsed || isMobileOpen) && (
            <div className="px-3 mb-2 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Main Menu</div>
          )}
          
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                title={item.label}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold group",
                  isActive 
                    ? "bg-white text-gray-900 shadow-md" 
                    : "text-gray-400 hover:bg-gray-800 hover:text-white",
                  isCollapsed && !isMobileOpen ? "justify-center px-0" : ""
                )}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={cn(
                  "shrink-0 transition-colors",
                  isActive ? "text-gray-900" : "text-gray-400 group-hover:text-white"
                )} />
                {(!isCollapsed || isMobileOpen) && (
                  <span className="text-xs tracking-wider uppercase whitespace-nowrap">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button 
            title="Sign Out"
            onClick={() => {
              document.cookie = "auth_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
              router.push('/');
            }}
            className={cn("flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all w-full font-semibold group",
              isCollapsed && !isMobileOpen ? "justify-center px-0" : ""
            )}
          >
            <LogOut size={20} strokeWidth={2} className="shrink-0 text-gray-400 group-hover:text-red-400" />
            {(!isCollapsed || isMobileOpen) && (
              <span className="text-xs tracking-wider uppercase whitespace-nowrap">Sign Out</span>
            )}
          </button>
        </div>

        {/* Desktop Collapse Toggle */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-4 top-8 w-8 h-8 bg-gray-800 border border-gray-700 rounded-full items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 transition-all shadow-md z-50"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full bg-[#f3f4f6]">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 z-30">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="NMG Logo" className="w-8 h-8 object-contain rounded-lg shadow-sm" />
            <span className="font-bold tracking-widest uppercase text-sm text-dark-900">NMG PHOTOPARK</span>
          </div>
          <button onClick={() => setIsMobileOpen(true)} className="p-2 text-dark-800 bg-gray-100 rounded-lg">
            <Menu size={24} strokeWidth={2} />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6 flex flex-col justify-between">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>

          <footer className="mt-8 pt-4 pb-2 border-t border-gray-200 text-[10px] font-bold text-dark-500 flex flex-col sm:flex-row items-center justify-between gap-2 px-2 max-w-7xl mx-auto w-full">
            <div>© 2026 NMG PHOTOPARK. All Rights Reserved</div>
            <div>Powered by <a href="https://www.cenexasystems.com" target="_blank" rel="noopener noreferrer" className="text-dark-900 font-extrabold hover:text-gray-600 hover:underline transition-colors">Cenexa Systems</a> © 2026</div>
            <div className="uppercase tracking-widest text-gray-500 font-extrabold">NMG PHOTOPARK</div>
          </footer>
        </div>
      </main>
    </div>
  );
}
