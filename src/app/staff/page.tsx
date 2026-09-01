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
  { id: "chennai-main", name: "Sarada College Road", location: "Sarada College Road" },
  { id: "bangalore-hub", name: "Puthur Road", location: "Puthur Road" },
  { id: "mumbai-central", name: "Old Bustand", location: "Old Bustand" },
];

export default function BranchSelectionPage() {
  const router = useRouter();

  const selectBranch = (branchId: string) => {
    router.push(`/${branchId}`);
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col items-center justify-center p-6 selection:bg-gray-200">
      
      <div className="w-full max-w-2xl text-center mb-10">
        <img src="/logo.png" alt="NMG Logo" className="w-16 h-16 object-contain mx-auto rounded-2xl shadow-lg mb-6" />
        <h1 className="text-3xl md:text-4xl font-bold tracking-widest uppercase text-dark-900 mb-3">
          NMG PHOTOPARK POS
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
            className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 flex flex-col items-center justify-center gap-4 transition-all hover:-translate-y-1 hover:shadow-xl hover:border-gray-400 group"
          >
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-dark-900 group-hover:text-white transition-colors">
              <Store className="text-gray-700 group-hover:text-white transition-colors" size={28} strokeWidth={1.5} />
            </div>
            
            <div className="text-center">
              <h2 className="text-lg font-bold text-dark-900 tracking-widest uppercase mb-1 group-hover:text-dark-900 transition-colors">
                {branch.name}
              </h2>
              <p className="text-[10px] font-bold text-dark-400 uppercase tracking-widest">
                {branch.location}
              </p>
            </div>

            <div className="mt-4 px-6 py-2 rounded-full bg-gray-100 text-[9px] font-bold text-dark-600 uppercase tracking-widest group-hover:bg-dark-900 group-hover:text-white transition-all">
              Enter POS →
            </div>
          </button>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link 
          href="/download"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gray-200 bg-white shadow-sm text-[10px] font-bold uppercase tracking-widest text-dark-600 transition-all hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-md"
        >
          <Download size={14} className="text-gray-700" /> Install Desktop / Mobile App
        </Link>
      </div>
      
    </div>
  );
}
