"use client";

import { getSession, signIn } from "next-auth/react";
import { FaGithub, FaGoogle } from "react-icons/fa";
import VoronoiBackground from "../../components/VoronoiBackground";

const providers = [
  { name: "GitHub", id: "github", icon: <FaGithub className="w-[15px] h-[15px] opacity-70" /> },
  { name: "Google", id: "google", icon: <FaGoogle className="w-[15px] h-[15px] opacity-70" /> },
];

export default function SignInPage() {
  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e]">
      <VoronoiBackground />

      {/* z-10 so everything sits above the fixed canvas */}
      <div className="relative z-10 h-8.75 bg-[#323233] border-b border-[#3e3e42] flex items-center px-4 gap-3">
        <span className="text-[13px] font-medium text-[#cccccc] tracking-tight">Voronoi</span>
        <span className="text-[11px] text-[#858585]">Code Library Manager</span>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[340px]">
          <p className="text-[10px] text-[#858585] uppercase tracking-[0.08em] mb-2.5">
            Get started
          </p>
          <h1 className="text-[20px] font-bold text-[#cccccc] tracking-tight mb-1">
            Sign in to Voronoi
          </h1>
          <p className="text-[11px] text-[#858585] mb-7 leading-relaxed">
            Access your snippets and libraries
          </p>

          <div className="h-px bg-[#3e3e42] mb-7" />

          <div className="space-y-2">
            {providers.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  signIn(p.id, { callbackUrl: "/" })
                }}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 border border-[#3e3e42] bg-[#2a2d2e] text-[#cccccc] text-[12px] hover:bg-[#37373d] hover:border-[#007acc] hover:text-white transition-colors"
              >
                {p.icon}
                Continue with {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}