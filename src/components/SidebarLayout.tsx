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
  Wallet
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NAV_ITEMS = [
  { href: "/", label: "BILLING PANEL", icon: Calculator },
  { href: "/history", label: "ORDER HISTORY", icon: History },
  { href: "/analytics", label: "ANALYTICS DASHBOARD", icon: BarChart3 },
  { href: "/customers", label: "CUSTOMERS", icon: Users },
  { href: "/expenses", label: "EXPENSES", icon: Wallet },
];

export function SidebarLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-gold-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-[#5c4a16] text-white flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between border-b border-gold-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold-400 rounded-md flex items-center justify-center font-bold text-dark-900">
              GR
            </div>
            <h1 className="font-bold text-lg leading-tight">Golden Retail</h1>
          </div>
          <button className="lg:hidden text-white" onClick={() => setIsMobileOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 py-6 flex flex-col gap-2 px-4">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-semibold text-sm tracking-wide",
                  isActive 
                    ? "bg-white text-[#5c4a16] shadow-sm" 
                    : "text-gold-200 hover:bg-gold-800 hover:text-white"
                )}
              >
                <Icon size={20} className={isActive ? "text-[#5c4a16]" : "text-gold-300"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-gold-600">
          <button className="flex items-center gap-4 px-4 py-3 rounded-xl text-gold-200 hover:bg-gold-800 hover:text-white transition-all w-full font-semibold text-sm tracking-wide">
            <LogOut size={20} />
            LOG OUT
          </button>
          <div className="mt-4 text-xs text-gold-400 font-medium px-4">
            v2.0 • PREMIUM POS
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gold-200 shadow-sm z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#5c4a16] text-white rounded-md flex items-center justify-center font-bold text-sm">
              GR
            </div>
            <span className="font-bold text-[#5c4a16]">Golden Retail</span>
          </div>
          <button onClick={() => setIsMobileOpen(true)} className="p-2 text-dark-900">
            <Menu size={24} />
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
