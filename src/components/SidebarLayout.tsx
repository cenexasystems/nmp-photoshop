"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

export function SidebarLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const branch = pathname.split('/')[1] || 'pos';

  const NAV_ITEMS = [
    { href: `/${branch}`, label: "BILLING", icon: Calculator },
    { href: `/${branch}/history`, label: "ORDERS", icon: History },
    { href: `/${branch}/customers`, label: "CUSTOMERS", icon: Users },
  ];

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[#f8f5ee] text-dark-900 overflow-hidden font-sans selection:bg-brand-gold/30 selection:text-dark-900">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-dark-950/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 bg-white border-r border-gold-200 flex flex-col transition-all duration-300 shadow-sm",
        isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0 lg:relative",
        isCollapsed && !isMobileOpen ? "lg:w-20" : "lg:w-72"
      )}>
        <div className={cn("p-6 flex items-center border-b border-gold-100", 
          isCollapsed && !isMobileOpen ? "justify-center" : "justify-between"
        )}>
          <div className={cn("flex items-center gap-3 transition-all", isCollapsed && !isMobileOpen ? "justify-center w-full" : "")}>
            <div className="w-8 h-8 rounded-lg bg-brand-gold flex shrink-0 items-center justify-center font-bold text-white text-sm tracking-tighter shadow-sm">
              GR
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div>
                <h1 className="font-bold text-lg tracking-widest uppercase text-dark-900 whitespace-nowrap">Golden</h1>
                <p className="text-[9px] font-bold text-brand-gold uppercase tracking-widest mt-0.5">{branch.replace(/-/g, ' ')} Branch</p>
              </div>
            )}
          </div>
          
          <button className="lg:hidden text-dark-500 hover:text-dark-900 transition-colors" onClick={() => setIsMobileOpen(false)}>
            <X size={24} strokeWidth={2} />
          </button>
        </div>


        <nav className="flex-1 py-6 flex flex-col gap-1 px-3 overflow-y-auto overflow-x-hidden">
          {(!isCollapsed || isMobileOpen) && (
            <div className="px-3 mb-2 text-[10px] uppercase tracking-[0.2em] text-dark-500 font-bold">Main Menu</div>
          )}
          
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== `/${branch}` && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                title={item.label}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-semibold group",
                  isActive 
                    ? "bg-brand-gold/10 text-brand-gold shadow-sm" 
                    : "text-dark-600 hover:bg-gold-50 hover:text-dark-900",
                  isCollapsed && !isMobileOpen ? "justify-center px-0" : ""
                )}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={cn(
                  "shrink-0 transition-colors",
                  isActive ? "text-brand-gold" : "text-dark-500 group-hover:text-dark-800"
                )} />
                {(!isCollapsed || isMobileOpen) && (
                  <span className="text-sm tracking-wide uppercase whitespace-nowrap">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gold-100">
          <button 
            title="Sign Out"
            className={cn("flex items-center gap-4 px-4 py-3 rounded-xl text-dark-600 hover:bg-red-50 hover:text-red-600 transition-all w-full font-semibold group",
              isCollapsed && !isMobileOpen ? "justify-center px-0" : ""
            )}
          >
            <LogOut size={20} strokeWidth={2} className="shrink-0 text-dark-500 group-hover:text-red-500" />
            {(!isCollapsed || isMobileOpen) && (
              <span className="text-sm tracking-wide uppercase whitespace-nowrap">Sign Out</span>
            )}
          </button>
        </div>

        {/* Desktop Collapse Toggle */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-4 top-8 w-8 h-8 bg-white border border-gold-200 rounded-full items-center justify-center text-dark-500 hover:text-brand-gold hover:border-brand-gold transition-all shadow-sm z-50"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full bg-[#f8f5ee]">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gold-200 z-30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-gold text-white flex items-center justify-center font-bold text-xs shadow-sm">
              GR
            </div>
            <span className="font-bold tracking-widest uppercase text-sm text-dark-900">Golden</span>
          </div>
          <button onClick={() => setIsMobileOpen(true)} className="p-2 text-dark-800 bg-gold-50 rounded-lg">
            <Menu size={24} strokeWidth={2} />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
