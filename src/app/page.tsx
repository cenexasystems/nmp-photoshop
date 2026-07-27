"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "./actions";
import { Lock } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.redirect) {
      router.push(result.redirect);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f5ee] flex flex-col items-center justify-center p-6 selection:bg-brand-gold/30">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-gold-200 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-gold mx-auto flex items-center justify-center font-bold text-white text-3xl tracking-tighter shadow-lg mb-6">
          <Lock className="text-white" size={28} strokeWidth={2} />
        </div>
        
        <h1 className="text-3xl font-bold tracking-widest uppercase text-dark-900 mb-2 text-center">
          Secure Access
        </h1>
        <p className="text-xs text-dark-500 font-bold uppercase tracking-[0.2em] mb-8 text-center">
          Enter your credentials to continue
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-dark-700 uppercase tracking-widest">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full px-4 py-3 rounded-xl border border-gold-200 bg-[#f8f5ee]/50 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold/50 transition-all text-dark-900"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-red-500 text-xs font-bold uppercase tracking-widest text-center mt-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 px-6 py-4 rounded-xl bg-brand-gold text-white text-xs font-bold uppercase tracking-widest hover:bg-brand-gold/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
