"use client";

import { Building2, Store, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BRANCHES = [
  { id: "chennai-main", name: "Chennai Main", location: "T. Nagar" },
  { id: "bangalore-hub", name: "Bangalore Hub", location: "Indiranagar" },
  { id: "mumbai-central", name: "Mumbai Central", location: "Andheri West" },
];

export default function BranchSelectionPage() {
  const router = useRouter();

  const selectBranch = (branchId: string) => {
    router.push(`/${branchId}`);
  };

  return (
    <div className="min-h-screen bg-[#f8f5ee] flex flex-col items-center justify-center p-6 selection:bg-brand-gold/30">
      
      <div className="w-full max-w-2xl text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-brand-gold mx-auto flex items-center justify-center font-bold text-white text-3xl tracking-tighter shadow-lg mb-6">
          GR
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-widest uppercase text-dark-900 mb-3">
          NMG PhotoShop POS
        </h1>
        <p className="text-sm text-dark-500 font-bold uppercase tracking-[0.2em]">
          Select your active branch to begin billing
        </p>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
        {BRANCHES.map((branch) => (
          <button
            key={branch.id}
            onClick={() => selectBranch(branch.id)}
            className="bg-white p-8 rounded-3xl shadow-sm border border-gold-200 flex flex-col items-center justify-center gap-4 transition-all hover:-translate-y-1 hover:shadow-xl hover:border-brand-gold/50 group"
          >
            <div className="w-16 h-16 rounded-full bg-gold-50 flex items-center justify-center group-hover:bg-brand-gold/10 transition-colors">
              <Store className="text-brand-gold" size={28} strokeWidth={1.5} />
            </div>
            
            <div className="text-center">
              <h2 className="text-lg font-bold text-dark-900 tracking-widest uppercase mb-1 group-hover:text-brand-gold transition-colors">
                {branch.name}
              </h2>
              <p className="text-[10px] font-bold text-dark-400 uppercase tracking-widest">
                {branch.location}
              </p>
            </div>

            <div className="mt-4 px-6 py-2 rounded-full bg-gold-50 text-[9px] font-bold text-dark-600 uppercase tracking-widest group-hover:bg-brand-gold group-hover:text-white transition-all">
              Enter POS →
            </div>
          </button>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link 
          href="/download"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gold-200 bg-white shadow-sm text-[10px] font-bold uppercase tracking-widest text-dark-600 transition-all hover:bg-gold-50 hover:-translate-y-0.5 hover:shadow-md"
        >
          <Download size={14} className="text-brand-gold" /> Install Desktop / Mobile App
        </Link>
      </div>
      
    </div>
  );
}
