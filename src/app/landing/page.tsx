// app/page.tsx
"use client";

import Link from "next/link";
import VoronoiBackground from "../components/VoronoiBackground"; // your animated background

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <VoronoiBackground />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 text-center px-4">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
          Welcome to Vorio
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl drop-shadow-sm">
          Your all-in-one platform for managing code snippets.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/auth/signin"
            className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition"
          >
            Get Started
          </Link>
          <Link
            href="#features"
            className="px-8 py-3 border border-white/70 text-white hover:bg-white/20 rounded-lg font-semibold transition"
          >
            Learn More
          </Link>
        </div>
      </div>

      {/* Features section */}
      <section id="features" className="relative z-10 py-24 px-6 bg-gradient-to-b from-black/0 to-black/70">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 text-center">
          <div className="bg-white/10 rounded-xl p-6 hover:bg-white/20 transition">
            <h3 className="text-xl font-bold mb-2 text-white">Organize Snippets</h3>
            <p className="text-gray-200">
              Keep all your code snippets neatly organized in folders for quick access.
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-6 hover:bg-white/20 transition">
            <h3 className="text-xl font-bold mb-2 text-white">Secure & Fast</h3>
            <p className="text-gray-200">
              Your data is encrypted and accessible anywhere. Speedy performance guaranteed.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-gray-400">
        © {new Date().getFullYear()} Voroi. All rights reserved.
      </footer>
    </div>
  );
}
